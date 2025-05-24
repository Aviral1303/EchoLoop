# Gmail OAuth Authentication Backend

This is a Node.js Express backend that handles Gmail OAuth authentication for the EchoLoop application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Google OAuth Credentials

1. **Place your Google OAuth client credentials file:**
   - Create an `auth` folder: `mkdir auth`
   - Copy your `client_secret_*.json` file to `auth/google-client-secret.json`

2. **Create environment variables:**
   - Copy `.env.example` to `.env`: `cp .env.example .env`
   - Open your `auth/google-client-secret.json` file
   - Update `.env` with the values from your JSON file:
     ```env
     GOOGLE_CLIENT_ID=your_client_id_from_json
     GOOGLE_CLIENT_SECRET=your_client_secret_from_json
     GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
     ```

### 3. Configure Google Cloud Console

Make sure your Google Cloud Console OAuth2 client has:
- **Authorized redirect URIs:** `http://localhost:3000/auth/callback`
- **Scopes enabled:**
  - Gmail API (gmail.readonly)
  - Google OAuth2 API (userinfo.email, userinfo.profile)

### 4. Start the Server
```bash
npm start
```

The server will start on http://localhost:3000

## 📡 API Endpoints

### Gmail OAuth Flow
- **GET `/auth/google`** - Start Gmail OAuth flow (redirects to Google)
- **GET `/auth/callback`** - OAuth callback handler (redirects to frontend)
- **GET `/auth/status`** - Check connection status (placeholder)
- **POST `/auth/disconnect`** - Disconnect Gmail account (placeholder)

### System Endpoints
- **GET `/`** - Server status and available endpoints
- **GET `/health`** - Health check

## 🔄 OAuth Flow

1. **Frontend initiates:** User clicks "Connect Gmail" → redirects to `http://localhost:3000/auth/google`
2. **Backend redirects:** Server redirects user to Google's OAuth consent screen
3. **User authorizes:** User grants permissions to access Gmail
4. **Google redirects:** Google redirects back to `http://localhost:3000/auth/callback?code=...`
5. **Backend processes:** Server exchanges code for tokens and logs them
6. **Frontend redirect:** User is redirected to `http://localhost:3001/dashboard/settings?connected=true`

## 🔧 What Happens During OAuth

When a user completes the OAuth flow:

1. **Authorization code is exchanged** for access & refresh tokens
2. **User information is retrieved** (email, name, profile picture)
3. **Tokens are logged** to console (for development)
4. **User is redirected** to frontend settings page

### Token Information Logged:
- User email and name
- Access token (truncated for security)
- Refresh token presence
- Token expiration time

## 🛡️ Security Notes

- **Development Mode:** Tokens are currently only logged to console
- **Production TODO:** Implement secure token storage (encrypted database)
- **CORS:** Configured for localhost:3001, 3002, 8080

## 📁 Project Structure

```
auth-backend/
├── auth/
│   ├── googleAuth.js          # Google OAuth utility functions
│   └── google-client-secret.json  # Your OAuth credentials (create this)
├── routes/
│   └── auth.js                # Express routes for OAuth
├── index.js                   # Main server file
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🔍 Testing the Setup

1. **Start the backend:** `npm start`
2. **Visit:** http://localhost:3000 (should show server status)
3. **Test OAuth:** http://localhost:3000/auth/google (should redirect to Google)
4. **Check logs:** Watch console for OAuth success messages

## 🚧 Next Steps

After OAuth is working:
1. Implement secure token storage
2. Add user session management  
3. Create email fetching endpoints
4. Add token refresh logic
5. Implement proper error handling

## 🐛 Troubleshooting

**"Error: Failed to generate authorization URL"**
- Check your `.env` file has correct Google OAuth credentials
- Verify `auth/google-client-secret.json` exists and is valid

**"OAuth callback failed"**
- Ensure redirect URI in Google Console matches: `http://localhost:3000/auth/callback`
- Check Google Cloud Console has Gmail API enabled

**"CORS errors"**
- Verify frontend is running on localhost:3001, 3002, or 8080
- Check CORS configuration in `index.js` 