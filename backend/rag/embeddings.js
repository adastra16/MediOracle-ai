/**
 * Embedding Service
 * Generates embeddings using OpenAI API
 */

import { OpenAIEmbeddings } from '@langchain/openai';
import logger from '../utils/logger.js';

class EmbeddingService {
  constructor() {
    this.embeddings = null;
    this.initialized = false;
  }

  /**
   * Initialize embeddings with OpenAI API key
   */
  async initialize() {
    if (this.initialized) return;

    try {
      this.embeddings = new OpenAIEmbeddings({
        modelName: 'text-embedding-3-small',
        openAIApiKey: process.env.OPENAI_API_KEY
      });

      this.initialized = true;
      logger.info('Embedding service initialized');
    } catch (error) {
      logger.error('Failed to initialize embeddings', error.message);
      throw error;
    }
  }

  /**
   * Generate embedding for a single text
   * @param {string} text - Text to embed
   * @returns {Promise<Array>} - Embedding vector
   */
  async generateEmbedding(text) {
    await this.initialize();

    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

      const embedding = await this.embeddings.embedQuery(text);
      return embedding;
    } catch (error) {
      logger.error('Embedding generation failed', error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   * @param {Array<string>} texts - Array of texts to embed
   * @returns {Promise<Array<Array>>} - Array of embeddings
   */
  async generateEmbeddingsBatch(texts) {
    await this.initialize();

    try {
      if (!Array.isArray(texts) || texts.length === 0) {
        throw new Error('Texts must be a non-empty array');
      }

      const embeddings = await this.embeddings.embedDocuments(texts);
      logger.info(`Generated ${embeddings.length} embeddings`, {});
      return embeddings;
    } catch (error) {
      logger.error('Batch embedding generation failed', error.message);
      throw error;
    }
  }

  /**
   * Get embedding model info
   * @returns {Object} - Model information
   */
  getModelInfo() {
    return {
      modelName: 'text-embedding-3-small',
      dimension: 1536,
      initialized: this.initialized
    };
  }
}

export default new EmbeddingService();
