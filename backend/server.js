const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Body parser (captures raw body for Stripe webhook signature verification)
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.startsWith('/api/payment/webhook')) {
      req.rawBody = buf;
    }
  }
}));

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/payment', require('./routes/payment'));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'HireMind API Server is fully operational' });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Express API Server running on port ${PORT}`);
});

// Self-healing Keep-Awake Background Ping for Python AI Microservice
if (process.env.AI_SERVICE_URL) {
  const AI_URL = process.env.AI_SERVICE_URL;
  console.log(`Keep-Awake: Initializing background pinger for AI service at ${AI_URL}`);
  setInterval(async () => {
    try {
      const response = await axios.get(`${AI_URL}/health`);
      console.log(`Keep-Awake Success: AI service responded with: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.warn(`Keep-Awake Warning: AI service ping failed: ${error.message}`);
    }
  }, 10 * 60 * 1000); // Ping every 10 minutes
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
