import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import warehouseRoutes from './routes/warehouseRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import productRoutes from './routes/productRoutes.js';
import stockBalanceRoutes from './routes/stockBalanceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import documentLineRoutes from './routes/documentLineRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Update this with your frontend URL
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to the database
connectDB();

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Authentication API is running...');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'ok',
    message: 'Authentication service is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/stock-balances', stockBalanceRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/document-lines', documentLineRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});