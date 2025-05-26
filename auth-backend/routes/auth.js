const express = require('express');
const { getAuthURL, getTokens } = require('../auth/googleAuth');
const gmailService = require('../services/gmailService');
const emailIntelligenceService = require('../services/emailIntelligenceService');
const { getConnectedUser, setConnectedUser, isUserConnected, disconnectUser } = require('../state/userState');

const router = express.Router();

/**
 * GET /auth/google
 * Initiates Gmail OAuth flow by redirecting to Google's authorization server
 */
router.get('/google', (req, res) => {
  try {
    console.log('📧 Starting Gmail OAuth flow...');
    
    const authUrl = getAuthURL();
    
    // Redirect user to Google's authorization server
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Error in /auth/google:', error);
    res.status(500).json({ 
      error: 'Failed to initiate OAuth flow',
      message: error.message 
    });
  }
});

/**
 * GET /auth/callback
 * Handles the OAuth callback from Google
 * Exchanges authorization code for tokens and redirects to frontend
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, error, error_description } = req.query;
    
    // Check if user denied access
    if (error) {
      console.error('❌ OAuth error:', error, error_description);
      return res.redirect(`http://localhost:3001/dashboard/settings?error=${encodeURIComponent(error_description || error)}`);
    }
    
    // Check if authorization code is present
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect('http://localhost:3001/dashboard/settings?error=no_code');
    }
    
    console.log('🔄 Processing OAuth callback with code...');
    
    // Exchange authorization code for tokens
    const tokenData = await getTokens(code);
    
    // Store user connection data using shared state
    setConnectedUser({
      isConnected: true,
      email: tokenData.user_info.email,
      name: tokenData.user_info.name,
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expiry_date
      },
      connectedAt: new Date().toISOString()
    });
    
    // Log the tokens (in production, you'd save these securely)
    console.log('🎉 OAuth Success! Token Data:');
    console.log('📧 User Email:', tokenData.user_info.email);
    console.log('👤 User Name:', tokenData.user_info.name);
    console.log('🔑 Access Token:', tokenData.access_token?.substring(0, 20) + '...');
    console.log('🔄 Refresh Token:', tokenData.refresh_token ? 'Present' : 'Not received');
    console.log('⏰ Token Expires:', new Date(tokenData.expiry_date));
    
    // For now, we'll just log success and redirect
    console.log('✅ Gmail OAuth completed successfully!');
    console.log('💾 User connection stored in shared state');
    
    // Redirect to frontend settings page with success parameter
    res.redirect('http://localhost:3001/dashboard/settings?connected=true');
    
  } catch (error) {
    console.error('❌ Error in OAuth callback:', error);
    
    // Redirect to frontend with error
    res.redirect(`http://localhost:3001/dashboard/settings?error=${encodeURIComponent('oauth_failed')}`);
  }
});

/**
 * GET /auth/status
 * Check OAuth connection status
 */
router.get('/status', (req, res) => {
  try {
    const connectedUser = getConnectedUser();
    
    // Check if user is connected and tokens are still valid
    const isTokenValid = isUserConnected();
    
    if (isTokenValid) {
      res.json({
        connected: true,
        email: connectedUser.email,
        name: connectedUser.name,
        connectedAt: connectedUser.connectedAt,
        tokenValid: true
      });
    } else {
      res.json({
        connected: false,
        email: '',
        name: '',
        connectedAt: null,
        tokenValid: false
      });
    }
  } catch (error) {
    console.error('❌ Error checking status:', error);
    res.status(500).json({
      error: 'Failed to check connection status'
    });
  }
});

/**
 * POST /auth/disconnect
 * Disconnect Gmail account
 */
router.post('/disconnect', (req, res) => {
  try {
    console.log('🔌 Disconnecting Gmail account...');
    
    // Clear stored connection data using shared state
    disconnectUser();
    
    console.log('✅ Gmail account disconnected successfully');
    
    res.json({
      success: true,
      message: 'Gmail account disconnected'
    });
  } catch (error) {
    console.error('❌ Error disconnecting:', error);
    res.status(500).json({
      error: 'Failed to disconnect Gmail account'
    });
  }
});

/**
 * GET /auth/user
 * Get current user information (if connected)
 */
router.get('/user', (req, res) => {
  try {
    const connectedUser = getConnectedUser();
    
    if (connectedUser.isConnected) {
      res.json({
        email: connectedUser.email,
        name: connectedUser.name,
        connectedAt: connectedUser.connectedAt,
        hasValidToken: connectedUser.tokens && new Date(connectedUser.tokens.expires_at) > new Date()
      });
    } else {
      res.status(401).json({
        error: 'No user connected'
      });
    }
  } catch (error) {
    console.error('❌ Error getting user info:', error);
    res.status(500).json({
      error: 'Failed to get user information'
    });
  }
});

/**
 * GET /auth/test-gmail
 * Test endpoint to verify Gmail service works with stored tokens
 */
router.get('/test-gmail', async (req, res) => {
  try {
    console.log('🧪 Testing Gmail service...');
    
    const connectedUser = getConnectedUser();
    
    // Check if user is connected
    if (!connectedUser.isConnected || !connectedUser.tokens) {
      return res.status(401).json({
        error: 'No Gmail account connected',
        message: 'Please connect your Gmail account first'
      });
    }
    
    // Initialize Gmail service with stored tokens
    const initialized = gmailService.initialize(connectedUser.tokens);
    if (!initialized) {
      return res.status(500).json({
        error: 'Failed to initialize Gmail service'
      });
    }
    
    // Try to fetch 3 emails
    const emails = await gmailService.getSimpleEmailsList(3);
    
    console.log(`✅ Gmail test successful! Fetched ${emails.length} emails`);
    
    res.json({
      success: true,
      message: `Successfully fetched ${emails.length} emails`,
      user: {
        email: connectedUser.email,
        name: connectedUser.name
      },
      emails: emails.map(email => ({
        id: email.id,
        from: email.from,
        subject: email.subject,
        date: email.date,
        snippet: email.snippet,
        unread: email.unread,
        starred: email.starred
      }))
    });
    
  } catch (error) {
    console.error('❌ Gmail test failed:', error);
    res.status(500).json({
      error: 'Gmail test failed',
      message: error.message
    });
  }
});

/**
 * GET /auth/emails
 * Get emails from the connected Gmail account - production endpoint
 * This is identical to test-gmail but for production use with more emails
 */
router.get('/emails', async (req, res) => {
  try {
    console.log('📧 AUTH: Fetching emails...');
    
    const connectedUser = getConnectedUser();
    
    // Check if user is connected
    if (!connectedUser.isConnected || !connectedUser.tokens) {
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
    
    // Fetch emails with full content
    const emails = await gmailService.getSimpleEmailsListWithContent(limit);
    
    console.log(`✅ AUTH: Successfully fetched ${emails.length} emails`);
    
    // Return emails in format expected by frontend
    res.json({
      success: true,
      message: `Successfully fetched ${emails.length} emails`,
      count: emails.length,
      user: {
        email: connectedUser.email,
        name: connectedUser.name
      },
      emails: emails.map(email => {
        // Add AI analysis to each email
        const aiAnalysis = emailIntelligenceService.analyzeEmail({
          subject: email.subject,
          content: email.content,
          sender: email.from
        });

        return {
          id: email.id,
          threadId: email.threadId,
          subject: email.subject || '(No Subject)',
          from: email.from || '(Unknown Sender)',
          to: email.to,
          date: email.date,
          snippet: email.snippet || '',
          content: email.content || email.snippet || '',
          rawHtml: email.rawHtml || '',
          hasHtml: email.hasHtml || false,
          unread: email.unread,
          starred: email.starred,
          // Add formatted date for easier frontend use
          formattedDate: email.date ? new Date(email.date).toLocaleDateString() : '',
          // Add short snippet for display
          shortSnippet: email.snippet ? 
            (email.snippet.length > 100 ? email.snippet.substring(0, 100) + '...' : email.snippet) 
            : '',
          // AI analysis data
          category: aiAnalysis.category,
          sentiment: aiAnalysis.sentiment,
          actions: aiAnalysis.actions,
          tasks: aiAnalysis.tasks,
          thread: aiAnalysis.thread
        };
      })
    });
    
  } catch (error) {
    console.error('❌ AUTH: Error fetching emails:', error);
    res.status(500).json({
      error: 'Failed to fetch emails',
      message: error.message
    });
  }
});

module.exports = { router }; 