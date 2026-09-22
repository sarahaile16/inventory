const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const isVercel = Boolean(process.env.VERCEL);

// ========== SECURITY MIDDLEWARE ==========
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cookieParser());

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];

const envOrigins = String(process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin / server-to-server / Vercel preview
      if (!origin) return callback(null, true);
      if (defaultOrigins.includes(origin) || envOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (/\.vercel\.app$/i.test(origin) || /\.vercel\.app$/i.test(new URL(origin).hostname)) {
        return callback(null, true);
      }
      return callback(null, true); // allow for demo deploy; tighten later if needed
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

let memoryServer = null;
let server;
let dbReady = null;

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
  if (mongoose.connection.readyState === 1) return 'connected';

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db';
  const looksLikeAtlas = /mongodb(\+srv)?:\/\//.test(uri) && !/localhost|127\.0\.0\.1/.test(uri);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ MongoDB connected successfully');
    return 'local';
  } catch (localError) {
    console.warn(`⚠️  Could not connect to MongoDB: ${localError.message}`);

    if (isVercel || process.env.SKIP_MEMORY_MONGO === 'true') {
      console.warn('⚠️  Continuing without MongoDB (demo auth accounts still work).');
      console.warn('   Set MONGODB_URI (Atlas) for persistent user accounts.');
      return 'none';
    }

    if (process.env.NODE_ENV === 'production' && looksLikeAtlas) {
      console.error('❌ MongoDB Atlas connection failed in production.');
      throw localError;
    }

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
      if (process.env.NODE_ENV === 'production' && !isVercel) {
        throw memoryError;
      }
      return 'none';
    }
  }
}

async function ensureDatabase() {
  if (!dbReady) {
    dbReady = (async () => {
      const mode = await connectDatabase();
      if (mode !== 'none') await seedDemoUsers();
      return mode;
    })();
  }
  return dbReady;
}

// Ensure DB before API routes (important on Vercel cold starts)
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api')) return next();
  try {
    await ensureDatabase();
  } catch (error) {
    console.error('DB init error:', error.message);
  }
  next();
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/movements', require('./routes/movementRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    platform: isVercel ? 'vercel' : 'node',
    time: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    platform: isVercel ? 'vercel' : 'node'
  });
});

function serveFrontend() {
  const distPath = path.join(__dirname, '../frontend/dist');
  const distExists = fs.existsSync(path.join(distPath, 'index.html'));

  if (!isVercel && distExists) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API route not found' });
      }
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
  await ensureDatabase();
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
    console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
    console.log(`📍 API: http://localhost:${PORT}/api/health`);
    if (distExists) console.log(`📝 Frontend build: ${distPath}`);
    else console.log('📝 Frontend: cd frontend && npm run dev → http://localhost:5174');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use.\n`);
      process.exit(1);
    }
    throw err;
  });
}

if (!isVercel) {
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  start();
} else {
  // Warm DB on cold start (best-effort)
  ensureDatabase().catch((err) => console.warn('Vercel DB warmup:', err.message));
}

module.exports = app;
