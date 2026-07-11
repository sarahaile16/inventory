const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// ========== SECURITY MIDDLEWARE ==========
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy (adjust as needed)
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; " +
    "font-src 'self';"
  );

  next();
});

// ========== COOKIE PARSER ==========
app.use(cookieParser());

// ========== CORS CONFIGURATION ==========
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========== BODY PARSERS ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== STATIC FILES ==========
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== REQUEST LOGGER ==========
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========== ROUTES ==========
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ========== TEST ROUTE ==========
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    cookies: req.cookies ? 'Cookies enabled' : 'No cookies',
    time: new Date().toISOString()
  });
});

// ========== HEALTH CHECK ROUTE ==========
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ========== MongoDB CONNECTION ==========
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// ========== SERVE FRONTEND DIST FOLDER ==========
// Serve static files from the dist folder (frontend build)
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// IMPORTANT: This should be AFTER all API routes
// Any route that doesn't start with /api will serve the index.html
app.get('*', (req, res) => {
  // Check if the request is for an API route (should be handled above)
  // For all other routes, serve the frontend index.html
  res.sendFile(path.join(distPath, 'index.html'));
});

// ========== ERROR HANDLING MIDDLEWARE ==========
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
  console.log('='.repeat(60));
  console.log(`📍 Frontend: http://localhost:${PORT}/`);
  console.log(`📍 Test: http://localhost:${PORT}/api/test`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 Auth: http://localhost:${PORT}/api/auth/login`);
  console.log(`📍 Products: http://localhost:${PORT}/api/products`);
  console.log(`📍 Customers: http://localhost:${PORT}/api/customers`);
  console.log(`📍 Users: http://localhost:${PORT}/api/users`);
  console.log(`📍 Settings: http://localhost:${PORT}/api/settings/categories`);
  console.log('='.repeat(60));
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}`);
  console.log(`📝 Frontend served from: ${distPath}`);
  console.log('='.repeat(60));
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;