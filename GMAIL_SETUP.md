# Gmail Integration Setup for EchoLoop

This guide will help you set up Gmail integration with EchoLoop to access your emails.

## Prerequisites

1. A Google account
2. OAuth 2.0 credentials downloaded from Google Cloud Console

## Setting Up Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and click on it
   - Click "Enable"

## Creating OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add a name (e.g., "EchoLoop Gmail Integration")
5. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:3000
   ```
6. Under "Authorized redirect URIs", add:
   ```
   http://localhost:8000/api/v1/auth/callback
   ```
7. Click "Create"
8. Download the JSON file by clicking the download button

## Configuring EchoLoop

1. Rename the downloaded JSON file to `credentials.json`
2. Place the `credentials.json` file in the root directory of your EchoLoop backend:
   ```
   EchoLoop/backend/credentials.json
   ```

## Starting the Application

1. Start the backend server:
   ```bash
   cd EchoLoop/backend
   uvicorn app.main:app --reload
   ```

2. Start the frontend development server:
   ```bash
   cd EchoLoop/frontend
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000/dashboard
   ```

4. Click the "Connect Gmail" button on the dashboard or navigate to:
   ```
   http://localhost:3000/gmail-auth
   ```

5. Follow the Google authentication flow to grant EchoLoop access to your Gmail account

## Troubleshooting

- If you encounter any errors during authentication, check that your `credentials.json` file is correctly placed in the backend directory
- Make sure both the backend and frontend servers are running
- Check that the redirect URI in your Google Cloud Console matches exactly what's configured in the application (`http://localhost:8000/api/v1/auth/callback`) 