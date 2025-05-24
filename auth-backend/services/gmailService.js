const { google } = require('googleapis');

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