const path = require('path');

// Load environment variables (supports server/.env, root .env, or cloud container environment)
try {
  require('dotenv').config();
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (err) {
  console.log('[ENV] Using container process environment variables');
}

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { initCronScheduler } = require('./services/cronJob');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Production & Development CORS Configuration
const allowedOrigins = [
  'https://anujaya-enterprises-erp-system.vercel.app',
  'https://anujaya-enterprises-erp-system.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, server health checks)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1');

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request Logger
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Serve static frontend in production if built
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// Catch-all GET handler for SPA frontend (Express v5 compatible)
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  const indexHtml = path.join(clientDist, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      // If client not yet built, serve helpful API landing
      res.json({
        message: "Anujaya & Global Enterprises ERP Backend API Active",
        endpoints: "/api/system/status, /api/global/*, /api/local/*, /api/alerts/*",
        port: PORT
      });
    }
  });
});

// Start Server
async function startServer() {
  await connectDB();
  initCronScheduler();

  app.listen(PORT, '0.0.0.0', () => {
    const hostUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    console.log(`================================================================`);
    console.log(` ANUJAYA & GLOBAL ENTERPRISES ERP SERVER READY`);
    console.log(` Host URL:    ${hostUrl}`);
    console.log(` Client URL:  https://anujaya-enterprises-erp-system.vercel.app`);
    console.log(` Backend API: ${hostUrl}/api/system/status`);
    console.log(` Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`================================================================`);
  });
}

startServer().catch(err => {
  console.error("Critical server bootstrap error:", err);
});
