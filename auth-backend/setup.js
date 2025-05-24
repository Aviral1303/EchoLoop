const fs = require('fs');
const path = require('path');

console.log('🔧 EchoLoop Gmail OAuth Setup');
console.log('================================\n');

// Check if auth directory exists
const authDir = path.join(__dirname, 'auth');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir);
  console.log('✅ Created auth directory');
}

// Check for Google client secret file
const clientSecretPath = path.join(authDir, 'google-client-secret.json');
const clientSecretFiles = fs.readdirSync('.').filter(file => file.startsWith('client_secret_') && file.endsWith('.json'));

if (clientSecretFiles.length > 0 && !fs.existsSync(clientSecretPath)) {
  const sourceFile = clientSecretFiles[0];
  fs.copyFileSync(sourceFile, clientSecretPath);
  console.log(`✅ Copied ${sourceFile} to auth/google-client-secret.json`);
  
  // Clean up the original file
  fs.unlinkSync(sourceFile);
  console.log(`🗑️  Removed original ${sourceFile}`);
}

// Read and parse the client secret file
if (fs.existsSync(clientSecretPath)) {
  try {
    const clientSecret = JSON.parse(fs.readFileSync(clientSecretPath, 'utf8'));
    const webConfig = clientSecret.web || clientSecret.installed;
    
    if (webConfig) {
      // Create .env file
      const envContent = `# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=${webConfig.client_id}
GOOGLE_CLIENT_SECRET=${webConfig.client_secret}
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3001
`;
      
      fs.writeFileSync('.env', envContent);
      console.log('✅ Created .env file with your Google OAuth credentials');
      
      // Display setup summary
      console.log('\n🎉 Setup Complete!');
      console.log('==================');
      console.log('📧 Client ID:', webConfig.client_id.substring(0, 20) + '...');
      console.log('🔑 Client Secret:', webConfig.client_secret.substring(0, 10) + '...');
      console.log('🔄 Redirect URI: http://localhost:3000/auth/callback');
      
      console.log('\n🚀 Next Steps:');
      console.log('1. Make sure your Google Cloud Console has the redirect URI configured');
      console.log('2. Run: npm start');
      console.log('3. Test OAuth: http://localhost:3000/auth/google');
      
      console.log('\n⚠️  Important:');
      console.log('Add this redirect URI to your Google Cloud Console:');
      console.log('http://localhost:3000/auth/callback');
      
    } else {
      console.log('❌ Invalid client secret file format');
    }
  } catch (error) {
    console.log('❌ Error reading client secret file:', error.message);
  }
} else {
  console.log('📋 Setup Instructions:');
  console.log('1. Download your Google OAuth client credentials JSON file');
  console.log('2. Place it in this directory (any client_secret_*.json file)');
  console.log('3. Run this setup script again: node setup.js');
  console.log('\nOr manually:');
  console.log('1. Copy your credentials file to auth/google-client-secret.json');
  console.log('2. Copy .env.example to .env and fill in your credentials');
} 