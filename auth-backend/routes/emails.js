const express = require('express');
const gmailService = require('../services/gmailService');
const { getConnectedUser, isUserConnected } = require('../state/userState');

const router = express.Router();

/**
 * GET /api/emails
 * Get a list of emails from the connected Gmail account
 * Using shared state module to access connectedUser properly
 */
router.get('/', async (req, res) => {
  try {
    console.log('📧 API: Fetching emails...');
    
    // Get connected user from shared state
    const connectedUser = getConnectedUser();
    
    console.log('📧 connectedUser status:', {
      isConnected: connectedUser?.isConnected,
      hasEmail: !!connectedUser?.email,
      hasTokens: !!connectedUser?.tokens
    });
    
    // Check if user is connected
    if (!isUserConnected()) {
      console.log('❌ No Gmail account connected');
      return res.status(401).json({
        error: 'No Gmail account connected',
        message: 'Please connect your Gmail account first'
      });
    }
    
    // Get number of emails to fetch (default 10, max 50)
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    
    console.log(`📨 Fetching ${limit} emails for ${connectedUser.email}`);
    
    // Initialize Gmail service with stored tokens
    const initialized = gmailService.initialize(connectedUser.tokens);
    if (!initialized) {
      return res.status(500).json({
        error: 'Failed to initialize Gmail service'
      });
    }
    
    // Fetch emails
    const emails = await gmailService.getSimpleEmailsList(limit);
    
    console.log(`✅ API: Successfully fetched ${emails.length} emails`);
    
    // Return emails in format expected by frontend
    res.json({
      success: true,
      message: `Successfully fetched ${emails.length} emails`,
      count: emails.length,
      user: {
        email: connectedUser.email,
        name: connectedUser.name
      },
      emails: emails.map(email => ({
        id: email.id,
        threadId: email.threadId,
        subject: email.subject || '(No Subject)',
        from: email.from || '(Unknown Sender)',
        to: email.to,
        date: email.date,
        snippet: email.snippet || '',
        unread: email.unread,
        starred: email.starred,
        // Add formatted date for easier frontend use
        formattedDate: email.date ? new Date(email.date).toLocaleDateString() : '',
        // Add short snippet for display
        shortSnippet: email.snippet ? 
          (email.snippet.length > 100 ? email.snippet.substring(0, 100) + '...' : email.snippet) 
          : ''
      }))
    });
    
  } catch (error) {
    console.error('❌ API: Error fetching emails:', error);
    res.status(500).json({
      error: 'Failed to fetch emails',
      message: error.message
    });
  }
});

module.exports = router; 