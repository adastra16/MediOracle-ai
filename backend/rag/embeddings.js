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
      if (!process.env.OPENAI_API_KEY) {
        logger.warn('OPENAI_API_KEY not set - embeddings service will use mock embeddings');
        this.initialized = true;
        return;
      }

      this.embeddings = new OpenAIEmbeddings({
        modelName: 'text-embedding-3-small',
        openAIApiKey: process.env.OPENAI_API_KEY
      });

      this.initialized = true;
      logger.info('Embedding service initialized');
    } catch (error) {
      logger.error('Failed to initialize embeddings', error.message);
      this.initialized = true; // Mark as initialized even if OpenAI fails
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

      // If embeddings not available, generate mock embedding
      if (!this.embeddings) {
        logger.debug('Using mock embedding generation');
        return this._generateMockEmbedding(text);
      }

      const embedding = await this.embeddings.embedQuery(text);
      return embedding;
    } catch (error) {
      logger.error('Embedding generation failed', error.message);
      // Fall back to mock embedding
      return this._generateMockEmbedding(text);
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

      // If embeddings not available, generate mock embeddings
      if (!this.embeddings) {
        logger.debug('Using mock embedding generation for batch');
        return texts.map(text => this._generateMockEmbedding(text));
      }

      const embeddings = await this.embeddings.embedDocuments(texts);
      logger.info(`Generated ${embeddings.length} embeddings`, {});
      return embeddings;
    } catch (error) {
      logger.error('Batch embedding generation failed', error.message);
      // Fall back to mock embeddings
      return texts.map(text => this._generateMockEmbedding(text));
    }
  }

  /**
   * Generate a mock embedding for demo purposes
   * Creates a simple hash-based vector representation
   * @param {string} text - Text to embed
   * @returns {Array<number>} - 1536-dimensional mock embedding
   */
  _generateMockEmbedding(text) {
    // Create a deterministic embedding with word-based semantic features
    const embedding = new Array(1536).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    
    // Create word frequency vector for semantic meaning
    words.forEach((word) => {
      if (word.length === 0) return;
      
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        const char = word.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
      }
      
      // Distribute word features across dimensions for better similarity
      const baseIdx = Math.abs(hash) % 1500;
      embedding[baseIdx] = (embedding[baseIdx] || 0) + 0.6;
      embedding[(baseIdx + 1) % 1536] = (embedding[(baseIdx + 1) % 1536] || 0) + 0.4;
      embedding[(baseIdx + 2) % 1536] = (embedding[(baseIdx + 2) % 1536] || 0) + 0.2;
    });

    // Normalize the embedding to unit vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => norm > 0 ? val / norm : val);
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
