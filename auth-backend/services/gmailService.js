const { google } = require('googleapis');
const { convert } = require('html-to-text');

class GmailService {
  constructor() {
    this.gmail = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Gmail API client with OAuth tokens
   * @param {Object} tokens - The OAuth tokens object
   * @param {string} tokens.access_token - Access token
   * @param {string} tokens.refresh_token - Refresh token
   * @param {string} tokens.expires_at - Token expiration date
   */
  initialize(tokens) {
    try {
      console.log('📧 Initializing Gmail service...');
      
      // Create OAuth2 client
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      // Set credentials
      oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: new Date(tokens.expires_at).getTime()
      });

      // Create Gmail API instance
      this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      this.isInitialized = true;
      
      console.log('✅ Gmail service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Gmail service:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Check if the service is properly initialized
   */
  checkInitialized() {
    if (!this.isInitialized || !this.gmail) {
      throw new Error('Gmail service not initialized. Call initialize() first.');
    }
  }

  /**
   * Extract and clean email body content from Gmail payload
   * @param {Object} payload - Gmail message payload
   * @returns {string} Cleaned email content
   */
  extractEmailContent(payload) {
    let content = '';
    
    try {
      // Try to get plain text first
      content = this.extractTextContent(payload, 'text/plain');
      
      // If no plain text, try HTML and convert it
      if (!content) {
        const htmlContent = this.extractTextContent(payload, 'text/html');
        if (htmlContent) {
          content = this.convertHtmlToText(htmlContent);
        }
      }
      
      // Clean up the content
      content = this.cleanEmailContent(content);
      
    } catch (error) {
      console.error('❌ Error extracting email content:', error);
      content = '';
    }
    
    return content || '';
  }

  /**
   * Recursively extract text content from email parts
   * @param {Object} payload - Gmail message payload
   * @param {string} mimeType - Target MIME type to extract
   * @returns {string} Extracted content
   */
  extractTextContent(payload, mimeType) {
    // Check if this part has the content we want
    if (payload.mimeType === mimeType && payload.body && payload.body.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
    
    // Check multipart content
    if (payload.parts && payload.parts.length > 0) {
      for (const part of payload.parts) {
        const content = this.extractTextContent(part, mimeType);
        if (content) {
          return content;
        }
      }
    }
    
    return '';
  }

  /**
   * Convert HTML content to clean text
   * @param {string} htmlContent - HTML content
   * @returns {string} Clean text content
   */
  convertHtmlToText(htmlContent) {
    try {
      return convert(htmlContent, {
        wordwrap: 80,
        preserveNewlines: true,
        selectors: [
          // Skip these elements entirely
          { selector: 'img', format: 'skip' },
          { selector: 'style', format: 'skip' },
          { selector: 'script', format: 'skip' },
          { selector: 'head', format: 'skip' },
          { selector: 'meta', format: 'skip' },
          { selector: 'link', format: 'skip' },
          // Format headers as block elements
          { selector: 'h1', format: 'block' },
          { selector: 'h2', format: 'block' },
          { selector: 'h3', format: 'block' },
          { selector: 'h4', format: 'block' },
          { selector: 'h5', format: 'block' },
          { selector: 'h6', format: 'block' }
        ]
      });
    } catch (error) {
      console.error('❌ Error converting HTML to text:', error);
      // Fallback: simple HTML tag removal
      return htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    }
  }

  /**
   * Clean up email content by removing headers, signatures, and other noise
   * @param {string} content - Raw email content
   * @returns {string} Cleaned content
   */
  cleanEmailContent(content) {
    if (!content) return '';
    
    let cleaned = content;
    
    try {
      // Remove email headers (lines that start with common header patterns)
      const headerPatterns = [
        /^From:.*$/gm,
        /^To:.*$/gm,
        /^Cc:.*$/gm,
        /^Bcc:.*$/gm,
        /^Subject:.*$/gm,
        /^Date:.*$/gm,
        /^Reply-To:.*$/gm,
        /^Message-ID:.*$/gm,
        /^X-.*:.*$/gm,
        /^Content-.*:.*$/gm,
        /^MIME-Version:.*$/gm,
        /^Received:.*$/gm,
        /^Return-Path:.*$/gm,
        /^Delivered-To:.*$/gm,
        /^Authentication-Results:.*$/gm,
        /^DKIM-Signature:.*$/gm,
        /^ARC-.*:.*$/gm
      ];
      
      headerPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
      });
      
      // Remove common email signature patterns
      const signaturePatterns = [
        /^--\s*$/gm, // Standard signature delimiter
        /^_{3,}.*$/gm, // Underscores
        /^-{3,}.*$/gm, // Dashes
        /^={3,}.*$/gm, // Equal signs
        /Sent from my .*/gi,
        /Get Outlook for .*/gi,
        /This email was sent from .*/gi,
        /Please consider the environment .*/gi,
        /CONFIDENTIALITY NOTICE.*/gi,
        /This communication .* confidential.*/gi
      ];
      
      signaturePatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
      });
      
      // Remove quoted email content (lines starting with >)
      cleaned = cleaned.replace(/^>.*$/gm, '');
      
      // Remove excessive whitespace and empty lines
      cleaned = cleaned
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
        .replace(/[ \t]+$/gm, '') // Remove trailing whitespace
        .replace(/^[ \t]+/gm, '') // Remove leading whitespace
        .trim();
      
      // If content is too short after cleaning, return original snippet
      if (cleaned.length < 20) {
        return content.trim();
      }
      
      return cleaned;
      
    } catch (error) {
      console.error('❌ Error cleaning email content:', error);
      return content.trim();
    }
  }

  /**
   * Fetch a basic list of emails (just message IDs and thread IDs)
   * @param {number} maxResults - Maximum number of emails to fetch (default: 5)
   * @returns {Promise<Array>} Array of email objects
   */
  async getEmailsList(maxResults = 5) {
    try {
      this.checkInitialized();
      
      console.log(`📨 Fetching ${maxResults} emails from Gmail...`);
      
      // Make the Gmail API call
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults,
        q: '' // Empty query gets all emails
      });

      const messages = response.data.messages || [];
      console.log(`✅ Successfully fetched ${messages.length} email IDs`);
      
      return messages;
    } catch (error) {
      console.error('❌ Error fetching emails list:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a specific email with full body content
   * @param {string} messageId - The Gmail message ID
   * @returns {Promise<Object>} Email details with full content
   */
  async getEmailDetailsWithBody(messageId) {
    try {
      this.checkInitialized();
      
      console.log(`📧 Fetching full details for email ID: ${messageId}`);
      
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full' // Get full email including body
      });

      const email = response.data;
      const headers = email.payload.headers;
      const subject = this.getHeaderValue(headers, 'Subject');
      
      // Extract and clean email body content
      const bodyContent = this.extractEmailContent(email.payload);
      
      console.log(`✅ Fetched and cleaned email: ${subject}`);
      
      return {
        ...email,
        bodyContent: bodyContent || email.snippet || ''
      };
    } catch (error) {
      console.error(`❌ Error fetching email details with body for ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Get a simplified list of emails with basic info and full content
   * @param {number} maxResults - Maximum number of emails to fetch
   * @returns {Promise<Array>} Array of simplified email objects with content
   */
  async getSimpleEmailsListWithContent(maxResults = 5) {
    try {
      // First get the list of message IDs
      const messagesList = await this.getEmailsList(maxResults);
      
      if (messagesList.length === 0) {
        console.log('📭 No emails found');
        return [];
      }

      // Then get details for each email with full content
      console.log(`📧 Fetching details with content for ${messagesList.length} emails...`);
      const emailsWithDetails = [];

      for (const message of messagesList) {
        try {
          const emailDetails = await this.getEmailDetailsWithBody(message.id);
          const headers = emailDetails.payload.headers;
          
          const simpleEmail = {
            id: emailDetails.id,
            threadId: emailDetails.threadId,
            from: this.getHeaderValue(headers, 'From'),
            to: this.getHeaderValue(headers, 'To'),
            subject: this.getHeaderValue(headers, 'Subject'),
            date: this.getHeaderValue(headers, 'Date'),
            snippet: emailDetails.snippet || '',
            content: emailDetails.bodyContent || emailDetails.snippet || '',
            unread: emailDetails.labelIds?.includes('UNREAD') || false,
            starred: emailDetails.labelIds?.includes('STARRED') || false
          };
          
          emailsWithDetails.push(simpleEmail);
        } catch (error) {
          console.error(`⚠️ Skipping email ${message.id} due to error:`, error.message);
        }
      }

      console.log(`✅ Successfully processed ${emailsWithDetails.length} emails with content`);
      return emailsWithDetails;
    } catch (error) {
      console.error('❌ Error getting simple emails list with content:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a specific email
   * @param {string} messageId - The Gmail message ID
   * @returns {Promise<Object>} Email details
   */
  async getEmailDetails(messageId) {
    try {
      this.checkInitialized();
      
      console.log(`📧 Fetching details for email ID: ${messageId}`);
      
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'metadata', // Get headers and basic info
        metadataHeaders: ['From', 'To', 'Subject', 'Date']
      });

      const email = response.data;
      console.log(`✅ Fetched email: ${this.getHeaderValue(email.payload.headers, 'Subject')}`);
      
      return email;
    } catch (error) {
      console.error(`❌ Error fetching email details for ${messageId}:`, error);
      throw error;
    }
  }

  /**
   * Helper function to extract header values
   * @param {Array} headers - Email headers array
   * @param {string} name - Header name to find
   * @returns {string} Header value or empty string
   */
  getHeaderValue(headers, name) {
    const header = headers.find(h => h.name === name);
    return header ? header.value : '';
  }

  /**
   * Get a simplified list of emails with basic info
   * @param {number} maxResults - Maximum number of emails to fetch
   * @returns {Promise<Array>} Array of simplified email objects
   */
  async getSimpleEmailsList(maxResults = 5) {
    try {
      // First get the list of message IDs
      const messagesList = await this.getEmailsList(maxResults);
      
      if (messagesList.length === 0) {
        console.log('📭 No emails found');
        return [];
      }

      // Then get details for each email
      console.log(`📧 Fetching details for ${messagesList.length} emails...`);
      const emailsWithDetails = [];

      for (const message of messagesList) {
        try {
          const emailDetails = await this.getEmailDetails(message.id);
          const headers = emailDetails.payload.headers;
          
          const simpleEmail = {
            id: emailDetails.id,
            threadId: emailDetails.threadId,
            from: this.getHeaderValue(headers, 'From'),
            to: this.getHeaderValue(headers, 'To'),
            subject: this.getHeaderValue(headers, 'Subject'),
            date: this.getHeaderValue(headers, 'Date'),
            snippet: emailDetails.snippet || '',
            unread: emailDetails.labelIds?.includes('UNREAD') || false,
            starred: emailDetails.labelIds?.includes('STARRED') || false
          };
          
          emailsWithDetails.push(simpleEmail);
        } catch (error) {
          console.error(`⚠️ Skipping email ${message.id} due to error:`, error.message);
        }
      }

      console.log(`✅ Successfully processed ${emailsWithDetails.length} emails`);
      return emailsWithDetails;
    } catch (error) {
      console.error('❌ Error getting simple emails list:', error);
      throw error;
    }
  }
}

module.exports = new GmailService(); 