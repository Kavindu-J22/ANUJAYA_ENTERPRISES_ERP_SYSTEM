require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { initCronScheduler } = require('./services/cronJob');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` ANUJAYA & GLOBAL ENTERPRISES ERP SERVER READY`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Backend API: http://localhost:${PORT}/api/system/status`);
    console.log(` Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`================================================================`);
  });
}

startServer().catch(err => {
  console.error("Critical server bootstrap error:", err);
});
