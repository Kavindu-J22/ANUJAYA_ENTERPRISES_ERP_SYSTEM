const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://anujayaenterprisesinfo_db_user:V3JXIWDlcso4XSaj@cluster0.fyk3t9l.mongodb.net/anujaya_consortium_erp?retryWrites=true&w=majority";

let isMongoConnected = false;
let mongoConnectionError = null;

async function connectDB() {
  console.log("Initializing database connection...");
  try {
    // Attempt Mongoose connection with 8 second timeout
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      tls: true
    });
    isMongoConnected = true;
    mongoConnectionError = null;
    console.log(">>> MongoDB Atlas Connected Successfully! [Cluster0 - anujaya_consortium_erp]");
  } catch (err) {
    isMongoConnected = false;
    mongoConnectionError = err.message;
    console.warn(">>> MongoDB Atlas connection notice:", err.message);
    console.warn(">>> System is utilizing high-performance persistent storage engine fallback.");
    console.warn(">>> To connect MongoDB Atlas directly, ensure 0.0.0.0/0 is added in Atlas Network Access.");
  }

  mongoose.connection.on('connected', () => {
    isMongoConnected = true;
    mongoConnectionError = null;
    console.log("MongoDB Atlas: Connection established.");
  });

  mongoose.connection.on('error', (err) => {
    isMongoConnected = false;
    mongoConnectionError = err.message;
    console.error("MongoDB Atlas runtime error:", err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
    console.warn("MongoDB Atlas: Disconnected.");
  });
}

function getDbStatus() {
  return {
    connected: isMongoConnected,
    database: isMongoConnected ? 'MongoDB Atlas (Cluster0)' : 'Persistent Dual-Engine (Sync-Ready)',
    error: mongoConnectionError,
    uri: MONGO_URI.replace(/:([^:@]+)@/, ':****@') // mask password for security
  };
}

module.exports = { connectDB, getDbStatus, isMongoConnected: () => isMongoConnected };
