const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

// ------------------------
// Connect to Database
// ------------------------
connectDB();

// ------------------------
// Security Middleware
// ------------------------
app.use(helmet());

// ------------------------
// Rate Limiting
// ------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// ------------------------
// CORS Configuration
// ------------------------
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true,
}));

// Preflight requests for all routes
app.options('*', cors());

// ------------------------
// Body Parsing Middleware
// ------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ------------------------
// Routes
// ------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/college', require('./routes/college'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/reports', require('./routes/reports'));

// ------------------------
// Health Check
// ------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ------------------------
// 404 Handler
// ------------------------
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ------------------------
// Global Error Handling
// ------------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message || err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// ------------------------
// Start Server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
