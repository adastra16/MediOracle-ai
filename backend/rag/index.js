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
    
    // Initialize OpenAI client lazily (will be set in initialize() after env vars are loaded)
      this.openaiClient = null;
    this.initialized = false;
  }

  /**
   * Get or initialize OpenAI client
   * @returns {OpenAI|null} OpenAI client instance or null if unavailable
   */
  _getOpenAIClient() {
    // Lazy initialization - check environment variable at runtime
    if (!this.openaiClient && process.env.OPENAI_API_KEY) {
      const apiKey = process.env.OPENAI_API_KEY.trim();
      
      // Validate API key format (should start with 'sk-')
      if (!apiKey.startsWith('sk-')) {
        logger.warn('OPENAI_API_KEY does not appear to be valid (should start with "sk-")');
        return null;
      }

      try {
        this.openaiClient = new OpenAI({
          apiKey: apiKey
        });
        logger.info('OpenAI client initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize OpenAI client', error.message);
        return null;
      }
    }
    
    return this.openaiClient;
  }

  /**
   * Initialize RAG pipeline
   */
  async initialize() {
    try {
      // Log environment variable status
      if (process.env.OPENAI_API_KEY) {
        const keyLength = process.env.OPENAI_API_KEY.length;
        const keyPreview = process.env.OPENAI_API_KEY.substring(0, 7) + '...' + process.env.OPENAI_API_KEY.slice(-4);
        logger.info(`OPENAI_API_KEY detected: ${keyPreview} (length: ${keyLength})`);
      } else {
        logger.warn('OPENAI_API_KEY not found in environment variables');
      }

      await EmbeddingService.initialize();

      // Initialize OpenAI client if API key is available
      const client = this._getOpenAIClient();

      // If an API key exists, verify that the OpenAI client can be used (avoid invalid key causing runtime errors)
      if (client) {
        try {
          // Try a simple API call to verify authentication (list models)
          await client.models.list();
          logger.info('OpenAI client authenticated and available');
        } catch (e) {
          logger.error('OpenAI client authentication failed', e.message);
          logger.warn('Running in demo mode - OpenAI features will be unavailable');
          this.openaiClient = null;
        }
      } else {
        logger.warn('OpenAI client not initialized - running in demo mode');
      }

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
   * Generate response using intelligent text extraction from retrieved documents (FREE - No OpenAI)
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

      if (!retrievedDocuments || retrievedDocuments.length === 0) {
        return {
          success: true,
          response: 'I could not find relevant medical information in the knowledge base. Please consult a healthcare provider for your questions.',
          sourcesUsed: [],
          confidence: 0.0,
          isDemoMode: false,
          tokensUsed: { input: 0, output: 0, total: 0 }
        };
      }

      // Extract query keywords for intelligent matching
      const queryLower = query.toLowerCase();
      const queryKeywords = queryLower.split(/\s+/).filter(word => word.length > 2);

      // Build intelligent response from retrieved documents
      let responseParts = [];
      
      // Medical disclaimer header
      responseParts.push('⚠️ **IMPORTANT MEDICAL DISCLAIMER**\n');
      responseParts.push('This information is for educational purposes only and does NOT constitute medical advice. Always consult a qualified healthcare provider for proper evaluation and treatment.\n');

      // Extract relevant information from each document
      const relevantExcerpts = [];
      retrievedDocuments.forEach((doc, idx) => {
        const content = doc.content;
        const contentLower = content.toLowerCase();
        
        // Find sentences that contain query keywords
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const relevantSentences = sentences.filter(sentence => {
          const sentenceLower = sentence.toLowerCase();
          return queryKeywords.some(keyword => sentenceLower.includes(keyword)) ||
                 queryLower.split(' ').some(word => sentenceLower.includes(word));
        });

        // If we found relevant sentences, use them; otherwise use the most relevant part
        let excerpt = '';
        if (relevantSentences.length > 0) {
          excerpt = relevantSentences.slice(0, 3).join('. ').trim();
        } else {
          // Extract a relevant portion around query keywords
          const keywordIndex = contentLower.indexOf(queryKeywords[0] || queryLower);
          if (keywordIndex !== -1) {
            const start = Math.max(0, keywordIndex - 150);
            const end = Math.min(content.length, keywordIndex + 300);
            excerpt = content.substring(start, end).trim();
            if (start > 0) excerpt = '...' + excerpt;
            if (end < content.length) excerpt = excerpt + '...';
          } else {
            excerpt = content.substring(0, 300).trim() + '...';
          }
        }

        if (excerpt) {
          relevantExcerpts.push({
            source: doc.metadata.source,
            excerpt: excerpt,
            similarity: doc.similarity
          });
        }
      });

      // Build the response
      responseParts.push(`**Based on your question: "${query}"**\n`);
      responseParts.push('Here is relevant educational information from the uploaded medical documents:\n');

      // Add excerpts with citations
      relevantExcerpts.forEach((item, idx) => {
        responseParts.push(`\n**Source ${idx + 1}** (from ${item.source}, relevance: ${(item.similarity * 100).toFixed(1)}%):`);
        responseParts.push(item.excerpt);
      });

      // Add summary and recommendations
      responseParts.push('\n---\n');
      responseParts.push('**Key Points:**');
      
      // Extract key points (simple extraction based on common medical patterns)
      const allContent = retrievedDocuments.map(d => d.content).join(' ');
      const keyPoints = this._extractKeyPoints(query, allContent);
      keyPoints.forEach(point => {
        responseParts.push(`• ${point}`);
      });

      responseParts.push('\n**Recommendations:**');
      responseParts.push('• Consult a qualified healthcare provider for proper evaluation');
      responseParts.push('• Keep track of symptoms and their progression');
      responseParts.push('• Follow basic health precautions (hygiene, rest, hydration)');
      responseParts.push('• Seek emergency care if symptoms worsen or become severe');

      const responseText = responseParts.join('\n');

      return {
        success: true,
        response: responseText,
        sourcesUsed: retrievedDocuments.map(doc => ({
          source: doc.metadata.source,
          similarity: doc.similarity.toFixed(3),
          excerpt: doc.content.substring(0, 100) + '...'
        })),
        confidence: retrievedDocuments.length > 0 ? 
          Math.min(0.95, retrievedDocuments[0].similarity + 0.1) : 0.5,
        isDemoMode: false,
        tokensUsed: {
          input: 0,
          output: 0,
          total: 0
        }
      };
    } catch (error) {
      logger.error('Response generation failed', error.message);
      throw error;
    }
  }

  /**
   * Extract key points from content based on query (FREE - No OpenAI)
   * @param {string} query - User query
   * @param {string} content - Document content
   * @returns {Array<string>} - Array of key points
   */
  _extractKeyPoints(query, content) {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const keyPoints = [];
    
    // Common medical patterns to extract
    const patterns = [
      { pattern: /symptoms?\s+(?:of|include|are|may include)[:.]?\s*([^.]+)/gi, label: 'Symptoms' },
      { pattern: /treatment[s]?\s+(?:of|for|include|may include)[:.]?\s*([^.]+)/gi, label: 'Treatment' },
      { pattern: /causes?\s+(?:of|include|are|may include)[:.]?\s*([^.]+)/gi, label: 'Causes' },
      { pattern: /prevention\s+(?:of|include|are|may include)[:.]?\s*([^.]+)/gi, label: 'Prevention' },
      { pattern: /diagnosis\s+(?:of|include|are|may include)[:.]?\s*([^.]+)/gi, label: 'Diagnosis' }
    ];

    patterns.forEach(({ pattern, label }) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        matches.slice(0, 2).forEach(match => {
          const point = match.replace(/symptoms?|treatment[s]?|causes?|prevention|diagnosis/gi, '').trim();
          if (point.length > 20 && point.length < 200) {
            keyPoints.push(`${label}: ${point.substring(0, 150)}`);
          }
        });
      }
    });

    // If no patterns found, extract sentences containing query keywords
    if (keyPoints.length === 0) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
      
      sentences.forEach(sentence => {
        const sentenceLower = sentence.toLowerCase();
        if (queryWords.some(word => sentenceLower.includes(word)) && sentence.length < 200) {
          keyPoints.push(sentence.trim());
          if (keyPoints.length >= 3) return;
        }
      });
    }

    return keyPoints.slice(0, 5); // Limit to 5 key points
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
   * Diagnose possible conditions using RAG + LLM or fallback rules
   * @param {Array|string} symptoms - List of symptoms or comma-separated string
   * @param {Object} options - Optional parameters like age, gender
   * @returns {Promise<Object>} - { success, possible_conditions, sources, isDemoMode }
   */
  async diagnoseSymptoms(symptoms, options = {}) {
    try {
      // Normalize symptoms to string
      const symptomsList = Array.isArray(symptoms) ? symptoms : (typeof symptoms === 'string' ? symptoms.split(',').map(s => s.trim()) : []);
      const query = `Symptoms: ${symptomsList.join(', ')}. Age: ${options.age || 'N/A'}. Gender: ${options.gender || 'N/A'}. Provide possible educational conditions.`;

      // Retrieve context
      const retrievedDocs = await this.retrieveRelevantDocuments(query, 6, parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.7);

      // Use FREE document-based condition analysis (No OpenAI required)
      logger.info('Using free document-based condition analysis');

        const lower = symptomsList.map(s => s.toLowerCase());

        // Small knowledge mapping for diseases -> keywords
        const diseaseMap = [
          { name: 'Dengue', keywords: ['dengue', 'dengue fever', 'aedes'] },
          { name: 'Gastroenteritis / Food poisoning', keywords: ['gastroenteritis', 'food poisoning', 'vomit', 'vomiting', 'diarrhea'] },
          { name: 'Upper gastrointestinal bleeding (e.g., peptic ulcer)', keywords: ['hematemesis', 'vomiting blood', 'upper gi bleed', 'peptic ulcer'] },
          { name: 'Respiratory infection (viral or bacterial)', keywords: ['influenza', 'flu', 'respiratory infection', 'cough', 'pneumonia'] },
          { name: 'Migraine / Headache disorder', keywords: ['migraine', 'severe headache', 'headache'] }
        ];

        // Aggregate evidence from documents
        const evidenceScores = {};
        retrievedDocs.forEach(doc => {
          const content = (doc.content || '').toLowerCase();
          diseaseMap.forEach(d => {
            let count = 0;
            d.keywords.forEach(kw => {
              // Count keyword occurrences
              const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
              const matches = content.match(re);
              if (matches) count += matches.length;
            });
            if (count > 0) {
              evidenceScores[d.name] = evidenceScores[d.name] || { score: 0, mentions: 0, docRefs: [] };
              // Weight by document similarity and count
              evidenceScores[d.name].score += (count * (doc.similarity || 0.5));
              evidenceScores[d.name].mentions += count;
              evidenceScores[d.name].docRefs.push({ source: doc.metadata.source, excerpt: content.substring(0, 240) });
            }
          });
        });

        // Build suggestions from evidence scores
        const suggestions = [];
        Object.entries(evidenceScores).forEach(([name, v]) => {
          // Normalize score into 0-1 (simple scaling)
          const raw = v.score;
          const confidence = Math.min(0.95, Math.max(0.2, raw / (1 + raw)));
          suggestions.push({ condition: name, confidence: Math.round(confidence * 100) / 100, rationale: `${v.mentions} relevant term(s) found in documents`, sources: v.docRefs });
        });

        // Also include symptom-based heuristics (urgent overrides)
        if (lower.some(s => s.includes('vomit') && s.includes('blood')) || lower.some(s => s.includes('nose') && s.includes('bleed') || s.includes('nosebleed') || s.includes('continuous'))) {
          suggestions.unshift({ condition: 'Urgent: Possible bleeding event (seek emergency care)', confidence: 0.98, rationale: 'Signs of active bleeding were reported.', sources: [] });
        }

        // If no suggestions from docs, fallback to simple symptom mapping
        if (suggestions.length === 0) {
          const simple = [];
          const joined = lower.join(' ');
          if (joined.includes('fever') && joined.includes('cough')) {
            simple.push({ condition: 'Possible respiratory infection (viral or bacterial)', confidence: 0.6, rationale: 'Fever and cough commonly indicate respiratory infections.' });
          }
          if (joined.includes('fever') && (joined.includes('stomach') || joined.includes('abdominal') || joined.includes('pain'))) {
            simple.push({ condition: 'Possible systemic infection such as dengue', confidence: 0.55, rationale: 'High fever with abdominal pain may indicate systemic infection.' });
          }
          if (joined.includes('vomit') && joined.includes('blood') || joined.includes('nose') && joined.includes('bleed')) {
            simple.unshift({ condition: 'Urgent: Possible bleeding event (seek emergency care)', confidence: 0.95, rationale: 'Bleeding signs (vomiting blood, nosebleed) require immediate evaluation.' });
          }
          if (simple.length === 0) {
            simple.push({ condition: 'Requires professional medical evaluation', confidence: 0.4, rationale: 'No clear mapping from symptoms to conditions; further evaluation required.' });
          }
          suggestions.push(...simple);
        }

        // Limit to 4 suggestions, ensure they are sorted by confidence
        suggestions.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

        return {
          success: true,
          possible_conditions: suggestions.slice(0, 4),
          sources: retrievedDocs.map(d => ({ source: d.metadata.source, similarity: d.similarity })),
          isDemoMode: false
        };
    } catch (error) {
      logger.error('Diagnosis failed', error.message);
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
