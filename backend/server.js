const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
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
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
app.use('/api/movements', require('./routes/movementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

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

let memoryServer = null;
let server;

async function seedDemoUsers() {
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count > 0) return;

    await User.create([
      { fullName: 'Sari Admin', username: 'sari', email: 'sari@example.com', phone: '0911000001', password: 'sari123', role: 'admin', requestedRole: '', status: 'Active' },
      { fullName: 'Store Manager', username: 'manager', email: 'manager@example.com', phone: '0911000002', password: 'manager123', role: 'management', requestedRole: 'management', status: 'Active' },
      { fullName: 'Store Staff', username: 'staff', email: 'staff@example.com', phone: '0911000003', password: 'staff123', role: 'staff', requestedRole: 'staff', status: 'Active' },
      { fullName: 'New User', username: 'user', email: 'user@example.com', phone: '0911000004', password: 'user123', role: 'user', requestedRole: 'staff', status: 'Pending' }
    ]);
    console.log('✅ Seeded demo accounts: sari, manager, staff, user');
  } catch (error) {
    console.warn('⚠️  Could not seed demo users:', error.message);
  }
}

async function connectDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected successfully');
    return 'local';
  } catch (localError) {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ MongoDB connection error:', localError.message);
      console.error('   Start MongoDB, or set MONGODB_URI in backend/.env');
      process.exit(1);
    }

    console.warn(`⚠️  Could not connect to ${uri}`);
    console.warn('   Starting in-memory MongoDB for development (data resets on restart).');

    try {
      await mongoose.disconnect().catch(() => {});
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      await mongoose.connect(memoryServer.getUri('inventory_db'));
      console.log('✅ In-memory MongoDB connected');
      return 'memory';
    } catch (memoryError) {
      console.error('❌ Could not start in-memory MongoDB:', memoryError.message);
      console.error('   Install MongoDB locally, or set MONGODB_URI to a MongoDB Atlas URI.');
      process.exit(1);
    }
  }
}

function serveFrontend() {
  const distPath = path.join(__dirname, '../frontend/dist');
  const distExists = fs.existsSync(path.join(distPath, 'index.html'));

  if (distExists) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return { distPath, distExists };
}

async function shutdown() {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('HTTP server closed');
  }
  await mongoose.connection.close(false).catch(() => {});
  if (memoryServer) {
    await memoryServer.stop();
  }
  process.exit(0);
}

async function start() {
  const dbMode = await connectDatabase();
  await seedDemoUsers();
  const { distPath, distExists } = serveFrontend();

  app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.stack);
    res.status(500).json({
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  const PORT = process.env.PORT || 5001;
  server = app.listen(PORT, () => {
    const mongoReady = mongoose.connection.readyState === 1;
    const mongoLabel = !mongoReady
      ? 'Disconnected ❌'
      : dbMode === 'memory'
        ? 'Connected ✅ (in-memory, data resets on restart)'
        : 'Connected ✅';

    console.log('\n' + '='.repeat(60));
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
    console.log('='.repeat(60));
    console.log(`📍 API: http://localhost:${PORT}/api/test`);
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
    console.log(`📍 Auth: http://localhost:${PORT}/api/auth/login`);
    console.log(`📍 Products: http://localhost:${PORT}/api/products`);
    console.log(`📍 Customers: http://localhost:${PORT}/api/customers`);
    console.log(`📍 Users: http://localhost:${PORT}/api/users`);
    console.log(`📍 Settings: http://localhost:${PORT}/api/settings/categories`);
    console.log('='.repeat(60));
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📝 MongoDB: ${mongoLabel}`);
    if (distExists) {
      console.log(`📝 Frontend build: ${distPath}`);
    } else {
      console.log('📝 Frontend: run Vite separately → http://localhost:5174');
      console.log(`   cd frontend && npm run dev`);
    }
    console.log('='.repeat(60));
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use by another app.`);
      console.error('   Stop that app, or set a different PORT in backend/.env\n');
      process.exit(1);
    }
    throw err;
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();

module.exports = app;