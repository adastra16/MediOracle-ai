/**
 * MediOracle AI - Backend Server
 * Express server with RAG pipeline, medical analysis, and safety guardrails
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import RAGPipeline from './rag/index.js';
import logger from './utils/logger.js';
import { MEDICAL_DISCLAIMER } from './utils/safety.js';

// Import routes
import ragRoutes from './routes/ragRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import medicalRoutes from './routes/medicalRoutes.js';

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

// Routes
app.use('/api', healthRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/medical', medicalRoutes);

// Root endpoint with disclaimer
app.get('/', (req, res) => {
  res.json({
    service: 'MediOracle AI Backend',
    version: '1.0.0',
    status: 'running',
    disclaimer: MEDICAL_DISCLAIMER,
    documentation: {
      baseURL: `http://localhost:${PORT}/api`,
      endpoints: {
        health: 'GET /health',
        info: 'GET /info',
        ragIngest: 'POST /rag/ingest (multipart/form-data with file)',
        ragQuery: 'POST /rag/query (JSON: { query })',
        ragStats: 'GET /rag/stats',
        medicalSymptoms: 'POST /medical/symptoms',
        medicalAnalyze: 'POST /medical/analyze'
      }
    }
  });
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
    // Initialize RAG pipeline
    await RAGPipeline.initialize();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`MediOracle AI Backend Server running on port ${PORT}`);
      logger.info(`Documentation: http://localhost:${PORT}`);
      logger.info(`API Base: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('Failed to start server', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
