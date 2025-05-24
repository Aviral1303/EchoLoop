const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Gmail API scopes
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

/**
 * Generate Gmail OAuth authorization URL
 * @returns {string} Authorization URL
 */
function getAuthURL() {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Gets refresh token
      scope: SCOPES,
      prompt: 'consent', // Forces consent screen to get refresh token
      include_granted_scopes: true
    });

    console.log('📧 Generated Gmail OAuth URL');
    return authUrl;
  } catch (error) {
    console.error('❌ Error generating auth URL:', error);
    throw new Error('Failed to generate authorization URL');
  }
}

/**
 * Exchange authorization code for access and refresh tokens
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Object} Token information
 */
async function getTokens(code) {
  try {
    console.log('🔄 Exchanging authorization code for tokens...');
    
    const { tokens } = await oauth2Client.getToken(code);
    
    // Set credentials for this client instance
    oauth2Client.setCredentials(tokens);
    
    // Get user info to verify the tokens work
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    console.log('✅ Successfully obtained tokens for user:', userInfo.data.email);
    
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
      scope: tokens.scope,
      user_info: {
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture
      }
    };
  } catch (error) {
    console.error('❌ Error getting tokens:', error);
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

/**
 * Verify if tokens are still valid
 * @param {Object} tokens - Token object
 * @returns {boolean} Whether tokens are valid
 */
async function verifyTokens(tokens) {
  try {
    oauth2Client.setCredentials(tokens);
    
    // Try to get user info to verify tokens
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    return !!userInfo.data.email;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return false;
  }
}

/**
 * Refresh expired access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Object} New token information
 */
async function refreshAccessToken(refreshToken) {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    console.log('✅ Successfully refreshed access token');
    return credentials;
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    throw new Error('Failed to refresh access token');
  }
}

module.exports = {
  getAuthURL,
  getTokens,
  verifyTokens,
  refreshAccessToken,
  oauth2Client
}; 