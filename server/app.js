const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/colleges');
const invitationRoutes = require('./routes/invitations');
const studentRoutes = require('./routes/students');
const facultyRoutes = require('./routes/faculty');
const batchRoutes = require('./routes/batches');
const branchRoutes = require('./routes/branches');
const testRoutes = require('./routes/tests');
const courseRoutes = require('./routes/courses');
const announcementRoutes = require('./routes/announcements');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

/* -------------------- Security -------------------- */
app.use(helmet());
app.use(compression());

const allowedOrigins = [
  'http://localhost:8080',                   // local dev
  'https://plantechx.netlify.app',          // production
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// handle preflight
app.options('*', cors());

/* -------------------- Logging -------------------- */
app.use(morgan('combined'));

/* -------------------- Body Parsing -------------------- */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* -------------------- Database -------------------- */
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

/* -------------------- Routes -------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Debug CORS check route
app.get('/api/test-cors', (req, res) => {
  res.json({ message: 'CORS working!' });
});

/* -------------------- Health Check -------------------- */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/* -------------------- Error Handling -------------------- */
// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error stack:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

/* -------------------- Server -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
