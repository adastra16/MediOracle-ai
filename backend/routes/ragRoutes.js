/**
 * RAG Routes - PDF ingestion and document Q&A endpoints
 */

import express from 'express';
import multer from 'multer';
import RAGPipeline from '../rag/index.js';
import logger from '../utils/logger.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route POST /rag/ingest
 * @desc Ingest a medical PDF document
 */
router.post('/ingest', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const result = await RAGPipeline.ingestPDF(req.file);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('PDF ingestion route error', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /rag/query
 * @desc Query the medical knowledge base with RAG
 */
router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query cannot be empty'
      });
    }

    const result = await RAGPipeline.query(query);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Query route error', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /rag/stats
 * @desc Get vector store and pipeline statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = RAGPipeline.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Stats route error', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route DELETE /rag/clear
 * @desc Clear all documents from vector store
 */
router.delete('/clear', (req, res) => {
  try {
    RAGPipeline.clear();

    res.json({
      success: true,
      message: 'Vector store cleared'
    });
  } catch (error) {
    logger.error('Clear route error', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
