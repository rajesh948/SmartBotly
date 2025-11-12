// ============================================
// SmartBotly Backend - Main Express Server
// ============================================

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';

// Import routes
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import webhookRoutes from './routes/webhook';
import clientAuthRoutes from './routes/clientAuth';
import adminClientRoutes from './routes/adminClients';
import productRoutes from './routes/products';
import faqRoutes from './routes/faqs';

// Load environment variables
dotenv.config();

// ============================================
// Initialize Express App
// ============================================

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Security Middleware
// ============================================

// Helmet - sets various HTTP headers for security
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// ============================================
// Body Parser Middleware
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Static Files - Serve Uploads
// ============================================

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// Health Check
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ============================================
// API Routes
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/client', clientAuthRoutes);
app.use('/api/admin/clients', adminClientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/faqs', faqRoutes);

// ============================================
// Error Handling
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// Start Server
// ============================================

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🤖 SMARTBOTLY BACKEND STARTED                ║
║                                                           ║
║  Server:      http://localhost:${PORT}                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}                          ║
║                                                           ║
║  Health:      http://localhost:${PORT}/health                 ║
║  Webhook:     http://localhost:${PORT}/api/webhook            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
      console.log('✅ Backend ready to receive requests');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully...');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;


