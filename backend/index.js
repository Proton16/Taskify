// server.js

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/session.routes.js';

dotenv.config();

const app = express();

// CORS Setup
const allowedOrigins = [
  'http://localhost:5173',            // for development
  // 'https://your-frontend.vercel.app'  // replace with your deployed frontend URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
