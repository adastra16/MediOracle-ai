/**
 * RAG Pipeline - Complete Retrieval Augmented Generation pipeline
 * Orchestrates: PDF ingestion → Chunking → Embedding → Vector Store → Retrieval → Generation
 */

import PDFIngestionService from './pdfIngestion.js';
import DocumentChunker from './chunker.js';
import EmbeddingService from './embeddings.js';
import VectorStore from './vectorStore.js';
import { OpenAI } from 'openai';
import logger from '../utils/logger.js';
import { enforceConstraints, detectEmergency, generateEmergencyResponse } from '../utils/safety.js';

class RAGPipeline {
  constructor() {
    this.vectorStore = new VectorStore();
    this.chunker = new DocumentChunker(
      parseInt(process.env.CHUNK_SIZE) || 500,
      parseInt(process.env.CHUNK_OVERLAP) || 100
    );
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.initialized = false;
  }

  /**
   * Initialize RAG pipeline
   */
  async initialize() {
    try {
      await EmbeddingService.initialize();
      this.initialized = true;
      logger.info('RAG Pipeline initialized');
    } catch (error) {
      logger.error('RAG Pipeline initialization failed', error.message);
      throw error;
    }
  }

  /**
   * Ingest PDF document into the system
   * @param {Object} file - PDF file from multer
   * @returns {Promise<Object>} - Ingestion result
   */
  async ingestPDF(file) {
    try {
      logger.info(`Ingesting PDF: ${file.originalname}`);

      // Extract text from PDF
      const extraction = await PDFIngestionService.processPDFFile(file);

      // Validate medical content
      const validation = PDFIngestionService.validateMedicalContent(extraction.text);

      if (validation.warning) {
        logger.warn('Medical content validation warning', validation.warning);
      }

      // Clean text
      const cleanedText = PDFIngestionService.cleanText(extraction.text);

      // Chunk the document
      const chunks = this.chunker.chunkText(cleanedText, file.originalname);
      logger.info(`Created ${chunks.length} chunks from PDF`);

      // Generate embeddings for chunks
      const chunkContents = chunks.map(c => c.content);
      const embeddings = await EmbeddingService.generateEmbeddingsBatch(chunkContents);

      // Add chunks to vector store
      chunks.forEach((chunk, index) => {
        this.vectorStore.addDocument(
          chunk.content,
          embeddings[index],
          {
            source: file.originalname,
            chunkIndex: index,
            totalChunks: chunks.length,
            ...chunk
          }
        );
      });

      logger.info(`PDF ingestion complete. ${chunks.length} chunks added to vector store`);

      return {
        success: true,
        fileName: file.originalname,
        fileSize: file.size,
        numPages: extraction.numPages,
        chunksCreated: chunks.length,
        validationResult: validation,
        vectorStoreStats: this.vectorStore.getStats()
      };
    } catch (error) {
      logger.error('PDF ingestion failed', error.message);
      throw error;
    }
  }

  /**
   * Retrieve relevant documents based on query
   * @param {string} query - User query
   * @param {number} topK - Number of results to return
   * @returns {Promise<Array>} - Retrieved documents
   */
  async retrieveRelevantDocuments(query, topK = 5) {
    try {
      // Generate embedding for query
      const queryEmbedding = await EmbeddingService.generateEmbedding(query);

      // Search vector store
      const threshold = parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.7;
      const results = this.vectorStore.search(queryEmbedding, topK, threshold);

      logger.info(`Retrieved ${results.length} relevant documents for query`);

      return results;
    } catch (error) {
      logger.error('Document retrieval failed', error.message);
      throw error;
    }
  }

  /**
   * Generate response using LLM with retrieved context
   * @param {string} query - User query
   * @param {Array} retrievedDocuments - Retrieved context documents
   * @returns {Promise<Object>} - Generated response with metadata
   */
  async generateResponse(query, retrievedDocuments) {
    try {
      // Check for emergency
      if (detectEmergency(query)) {
        logger.warn('Emergency keywords detected in query');
        return generateEmergencyResponse();
      }

      // Build context from retrieved documents
      const context = retrievedDocuments
        .map((doc, idx) => `[Source ${idx + 1}: ${doc.metadata.source}]\n${doc.content}`)
        .join('\n\n---\n\n');

      const systemPrompt = `You are a medical education assistant providing health information.

CRITICAL SAFETY CONSTRAINTS:
1. NEVER diagnose medical conditions
2. NEVER prescribe medications
3. ALWAYS recommend consulting a healthcare provider
4. NEVER claim to be a substitute for professional medical advice
5. Flag emergency symptoms and direct to emergency services
6. Use educational language only
7. Cite your sources (provided documents)

For every response:
- Start with a safety disclaimer
- Provide educational information ONLY
- Suggest professional consultation
- Cite the source documents used

Remember: You are providing EDUCATIONAL information, NOT medical advice.`;

      const userPrompt = `Based on the following medical documents, please answer this question:

QUESTION: ${query}

CONTEXT FROM DOCUMENTS:
${context}

IMPORTANT:
- Answer based ONLY on the provided documents
- Use educational language
- Do NOT diagnose
- Recommend professional consultation
- Cite your sources`;

      // Call OpenAI API with v4 SDK
      const message = await this.openaiClient.messages.create({
        model: 'gpt-4',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        system: systemPrompt
      });

      let responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      // Enforce medical safety constraints
      responseText = enforceConstraints(responseText);

      return {
        success: true,
        response: responseText,
        sourcesUsed: retrievedDocuments.map(doc => ({
          source: doc.metadata.source,
          similarity: doc.similarity.toFixed(3),
          excerpt: doc.content.substring(0, 100) + '...'
        })),
        confidence: retrievedDocuments.length > 0 ? 0.8 : 0.5,
        tokensUsed: {
          input: message.usage.input_tokens,
          output: message.usage.output_tokens
        }
      };
    } catch (error) {
      logger.error('Response generation failed', error.message);
      throw error;
    }
  }

  /**
   * Complete RAG query pipeline
   * @param {string} query - User query
   * @returns {Promise<Object>} - Complete response with retrieval and generation
   */
  async query(query) {
    try {
      logger.info(`Processing query: ${query.substring(0, 50)}...`);

      // Retrieve relevant documents
      const retrievedDocs = await this.retrieveRelevantDocuments(query);

      if (retrievedDocs.length === 0) {
        return {
          success: true,
          response: 'I could not find relevant medical information in the knowledge base. Please consult a healthcare provider for your questions.',
          sourcesUsed: [],
          confidence: 0.0
        };
      }

      // Generate response
      const response = await this.generateResponse(query, retrievedDocs);

      return response;
    } catch (error) {
      logger.error('Query processing failed', error.message);
      throw error;
    }
  }

  /**
   * Get vector store statistics
   * @returns {Object}
   */
  getStats() {
    return {
      vectorStoreStats: this.vectorStore.getStats(),
      chunkerConfig: this.chunker.getConfig(),
      embeddingModel: EmbeddingService.getModelInfo()
    };
  }

  /**
   * Clear vector store
   */
  clear() {
    this.vectorStore.clear();
    logger.info('Vector store cleared');
  }
}

export default new RAGPipeline();
