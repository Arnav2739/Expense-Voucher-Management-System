const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// High limit for handling base64 drawn signatures
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static uploaded signature files
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Expense Voucher Management System API',
  });
});

// Root informative endpoint - redirects browser directly to frontend on port 3000
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.redirect('http://localhost:3000');
  }
  res.status(200).json({
    success: true,
    message: 'Expense Voucher Management System Backend API is running.',
    frontendUrl: 'http://localhost:3000',
    healthCheck: 'http://localhost:5000/api/health',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Fallback error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
