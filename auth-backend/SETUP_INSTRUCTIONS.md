# 🚀 Gmail OAuth Setup Instructions

## What You Have Now

✅ **Complete Node.js Express backend** with Gmail OAuth authentication  
✅ **All required dependencies installed** (express, googleapis, cors, dotenv)  
✅ **Proper project structure** with auth utilities and routes  
✅ **Automated setup script** to configure your credentials  

---

## 🔧 What You Need To Do

### Step 1: Add Your Google OAuth Credentials

1. **Place your downloaded `client_secret_*.json` file** in this directory (`auth-backend/`)

2. **Run the automated setup:**
   ```bash
   npm run setup
   ```
   
   This will:
   - Move your credentials file to `auth/google-client-secret.json`
   - Create a `.env` file with your OAuth settings
   - Display your configuration summary

### Step 2: Configure Google Cloud Console

In your Google Cloud Console OAuth2 client, make sure you have:

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
```

### Step 3: Start the Backend

```bash
npm start
```

Your auth backend will be running on **http://localhost:3000**

---

## 🧪 Testing the Setup

### 1. Check Server Status
Visit: http://localhost:3000  
*Should show server info and available endpoints*

### 2. Test OAuth Flow
Visit: http://localhost:3000/auth/google  
*Should redirect you to Google's login page*

### 3. Complete OAuth
- Login with your Google account
- Grant permissions
- You should be redirected to: `http://localhost:3001/dashboard/settings?connected=true`
- Check your console logs for token information

---

## 📁 Your Project Structure

```
auth-backend/
├── auth/
│   ├── googleAuth.js                    # OAuth utility functions
│   └── google-client-secret.json        # Your credentials (auto-created)
├── routes/
│   └── auth.js                         # Express OAuth routes
├── index.js                            # Main server
├── setup.js                           # Auto-setup script
├── .env                               # Your OAuth config (auto-created)
└── README.md                          # Detailed documentation
```

---

## 🎯 What This Backend Does

### OAuth Endpoints:
- **`GET /auth/google`** → Starts Gmail OAuth (redirects to Google)
- **`GET /auth/callback`** → Handles Google's response, logs tokens
- **`GET /auth/status`** → Connection status (placeholder for now)
- **`POST /auth/disconnect`** → Disconnect account (placeholder)

### OAuth Flow:
1. User clicks "Connect Gmail" → redirects to `/auth/google`
2. Backend redirects to Google's OAuth consent screen
3. User grants permissions
4. Google redirects back with authorization code
5. Backend exchanges code for access & refresh tokens
6. **Tokens are logged to console** (for development)
7. User redirected to frontend with success notification

---

## 🔍 Expected Console Output

When OAuth succeeds, you'll see:
```
🔄 Exchanging authorization code for tokens...
🎉 OAuth Success! Token Data:
📧 User Email: your-email@gmail.com
👤 User Name: Your Name
🔑 Access Token: ya29.a0AfH6SMC8h...
🔄 Refresh Token: Present
⏰ Token Expires: Fri May 24 2024 10:30:00 GMT-0700
✅ Gmail OAuth completed successfully!
```

---

## 🚧 Next Steps (After OAuth Works)

1. **Test the complete flow** from your frontend settings page
2. **Implement token storage** (database, secure session management)
3. **Add Gmail data fetching** endpoints
4. **Create user session management**
5. **Integrate with your main EchoLoop backend**

---

## 🆘 Troubleshooting

**"Failed to generate authorization URL"**
- Run `npm run setup` to configure credentials
- Check that `.env` file was created with valid values

**"OAuth callback failed"**  
- Verify redirect URI in Google Console: `http://localhost:3000/auth/callback`
- Ensure Gmail API is enabled in your Google Cloud project

**"CORS errors"**  
- Make sure your frontend is running on localhost:3001, 3002, or 8080

**Frontend not redirecting properly**  
- The backend redirects to `http://localhost:3001/dashboard/settings?connected=true`
- Make sure your frontend is running and can handle this route

---

## ✅ Success Criteria

You'll know it's working when:
1. ✅ Server starts without errors on http://localhost:3000
2. ✅ `/auth/google` redirects to Google's login page  
3. ✅ After login, you're redirected to frontend settings page
4. ✅ Console shows successful token exchange with user info
5. ✅ Frontend receives `?connected=true` parameter

**Ready to start? Run `npm run setup` first!** 🚀 