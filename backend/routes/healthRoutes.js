/**
 * Health Routes - System health and info endpoints
 */

import express from 'express';
import { MEDICAL_DISCLAIMER } from '../utils/safety.js';

const router = express.Router();

/**
 * @route GET /health
 * @desc Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MediOracle AI - RAG Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * @route GET /info
 * @desc Get API information and disclaimer
 */
router.get('/info', (req, res) => {
  res.json({
    service: 'MediOracle AI - Intelligent Healthcare Assistant',
    version: '1.0.0',
    description: 'LLM + RAG powered medical knowledge base with safety guardrails',
    disclaimer: MEDICAL_DISCLAIMER,
    endpoints: {
      rag: {
        ingest: 'POST /api/rag/ingest',
        query: 'POST /api/rag/query',
        stats: 'GET /api/rag/stats',
        clear: 'DELETE /api/rag/clear'
      },
      medical: {
        analyze: 'POST /api/medical/analyze',
        symptoms: 'POST /api/medical/symptoms'
      },
      health: 'GET /api/health'
    }
  });
});

export default router;
