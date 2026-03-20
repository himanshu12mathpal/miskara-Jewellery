import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options ensure reliable production connections
      serverSelectionTimeoutMS: 10000, // 10 sec to find server
      socketTimeoutMS:          45000, // 45 sec socket timeout
      maxPoolSize:              10,    // max 10 connections
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events in production
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
