const express = require('express');
const gmailService = require('../services/gmailService');

const router = express.Router();

/**
 * GET /api/emails
 * Get a list of emails from the connected Gmail account
 * This endpoint copies the EXACT logic from the working test endpoint
 */
router.get('/', async (req, res) => {
  try {
    console.log('📧 API: Fetching emails...');
    
    // EXACT COPY of working test endpoint logic - we'll access the connectedUser directly
    // from the auth module's internal state, but we need to do it the same way the test does
    
    // First, let's get the module and check what we have access to
    const authModule = require('./auth');
    console.log('📧 Auth module keys:', Object.keys(authModule));
    
    // The working test endpoint must be accessing connectedUser somehow
    // Let's try both approaches
    let connectedUser;
    
    // Try method 1: direct access
    if (authModule.connectedUser) {
      connectedUser = authModule.connectedUser;
      console.log('📧 Got connectedUser via direct access');
    }
    
    // Try method 2: destructuring (like test endpoint)
    if (!connectedUser) {
      try {
        const { connectedUser: cu } = authModule;
        connectedUser = cu;
        console.log('📧 Got connectedUser via destructuring');
      } catch (e) {
        console.log('📧 Destructuring failed:', e.message);
      }
    }
    
    console.log('📧 Final connectedUser:', connectedUser ? 'Found' : 'Not found');
    console.log('📧 isConnected:', connectedUser?.isConnected);
    console.log('📧 hasTokens:', !!connectedUser?.tokens);
    
    // Check if user is connected (EXACT same logic as test endpoint)
    if (!connectedUser.isConnected || !connectedUser.tokens) {
      return res.status(401).json({
        error: 'No Gmail account connected',
        message: 'Please connect your Gmail account first'
      });
    }
    
    // Get number of emails to fetch (default 10, max 50)
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    
    console.log(`📨 Fetching ${limit} emails for ${connectedUser.email}`);
    
    // Initialize Gmail service (EXACT same as test endpoint)
    const initialized = gmailService.initialize(connectedUser.tokens);
    if (!initialized) {
      return res.status(500).json({
        error: 'Failed to initialize Gmail service'
      });
    }
    
    // Try to fetch emails (EXACT same as test endpoint)
    const emails = await gmailService.getSimpleEmailsList(limit);
    
    console.log(`✅ API: Successfully fetched ${emails.length} emails`);
    
    // Return emails in EXACT same format as test endpoint, but enhanced for frontend
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