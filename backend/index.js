/**
 * MediOracle AI - Backend Server
 * Express server with RAG pipeline, medical analysis, and safety guardrails
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import RAGPipeline from './rag/index.js';
import logger from './utils/logger.js';
import { MEDICAL_DISCLAIMER } from './utils/safety.js';

// Import routes
import ragRoutes from './routes/ragRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import medicalRoutes from './routes/medicalRoutes.js';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Medical Disclaimer Header
app.use((req, res, next) => {
  res.set('X-Medical-Disclaimer', 'This service provides educational information only. Not a substitute for professional medical advice.');
  next();
});

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// Routes
app.use('/api', healthRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/medical', medicalRoutes);

// Serve frontend for all non-API routes (SPA routing)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * Initialize server
 */
async function startServer() {
  try {
    // Initialize RAG pipeline with timeout
    const initPromise = RAGPipeline.initialize();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('RAG Pipeline initialization timeout')), 5000)
    );
    
    await Promise.race([initPromise, timeoutPromise]).catch(err => {
      logger.warn('RAG Pipeline initialization issue:', err.message);
      // Continue anyway
    });

    // Start listening
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`MediOracle AI Backend Server running on port ${PORT}`);
      logger.info(`Documentation: http://localhost:${PORT}`);
      logger.info(`API Base: http://localhost:${PORT}/api`);
    });
    
    // Handle server errors
    server.on('error', (err) => {
      logger.error('Server error:', err.message);
    });
    
  } catch (error) {
    logger.error('Failed to start server', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
