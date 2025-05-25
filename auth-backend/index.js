const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { router: authRoutes } = require('./routes/auth');
const emailsRoutes = require('./routes/emails');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:8080'], // Frontend URLs
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/api/emails', emailsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'EchoLoop Auth Backend Server is running!',
    endpoints: {
      'GET /auth/google': 'Start Gmail OAuth flow',
      'GET /auth/callback': 'OAuth callback handler',
      'GET /auth/status': 'Check connection status',
      'GET /auth/test-gmail': 'Test Gmail API connection',
      'GET /api/emails': 'Get emails from connected Gmail account',
      'GET /api/emails/:id': 'Get specific email details'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler - Fixed the problematic route pattern
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Auth Backend Server running on http://localhost:${PORT}`);
  console.log(`📧 Gmail OAuth available at http://localhost:${PORT}/auth/google`);
  console.log(`📨 Emails API available at http://localhost:${PORT}/api/emails`);
}); 