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
   * @param {number} threshold - Similarity threshold (optional)
   * @returns {Promise<Array>} - Retrieved documents
   */
  async retrieveRelevantDocuments(query, topK = 5, threshold = null) {
    try {
      // Generate embedding for query
      const queryEmbedding = await EmbeddingService.generateEmbedding(query);

      // Use lower threshold for mock embeddings (since they're less accurate)
      // Check if we're using mock embeddings by checking if OpenAI is available
      const hasValidApiKey = process.env.OPENAI_API_KEY && 
                              process.env.OPENAI_API_KEY.startsWith('sk-');
      // We'll use lower threshold as default since mock embeddings are common
      const isMockEmbedding = !hasValidApiKey;
      
      // Lower threshold for mock embeddings, higher for real embeddings
      const defaultThreshold = isMockEmbedding ? 0.1 : 0.7;
      const searchThreshold = threshold !== null ? threshold : defaultThreshold;

      // Search vector store
      let results = this.vectorStore.search(queryEmbedding, topK, searchThreshold);

      // If no results found with embeddings, try keyword-based search as fallback
      if (results.length === 0 && this.vectorStore.getDocumentCount() > 0) {
        logger.info('No results from embedding search, trying keyword-based search');
        results = this._keywordSearch(query, topK);
      }

      logger.info(`Retrieved ${results.length} relevant documents for query`);

      return results;
    } catch (error) {
      logger.error('Document retrieval failed', error.message);
      // Fallback to keyword search if embedding fails
      if (this.vectorStore.getDocumentCount() > 0) {
        logger.info('Falling back to keyword search due to embedding error');
        return this._keywordSearch(query, topK);
      }
      throw error;
    }
  }

  /**
   * Keyword-based document search (fallback when embeddings don't work well)
   * @param {string} query - User query
   * @param {number} topK - Number of results to return
   * @returns {Array} - Retrieved documents
   */
  _keywordSearch(query, topK = 5) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    
    // Get all documents from vector store
    const allDocs = this.vectorStore.documents || [];
    
    // Score documents based on keyword matches
    const scoredDocs = allDocs.map(doc => {
      const contentLower = (doc.content || '').toLowerCase();
      let score = 0;
      let matchCount = 0;
      
      queryWords.forEach(word => {
        // Count occurrences of each query word
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = contentLower.match(regex);
        if (matches) {
          matchCount += matches.length;
          score += matches.length;
        }
      });
      
      // Bonus for exact phrase match
      if (contentLower.includes(queryLower)) {
        score += 10;
      }
      
      // Calculate similarity score (0-1 range)
      const similarity = Math.min(0.95, Math.max(0.1, score / (queryWords.length * 2 + 10)));
      
      return {
        ...doc,
        similarity: similarity,
        matchCount: matchCount
      };
    });
    
    // Sort by score and return top K
    const results = scoredDocs
      .filter(doc => doc.similarity > 0.1) // Only return documents with some relevance
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(({ embedding, matchCount, ...rest }) => rest); // Remove embedding and matchCount from result
    
    logger.info(`Keyword search found ${results.length} relevant documents`);
    return results;
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
      responseParts.push('Here is relevant educational information from your uploaded medical document:\n');

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

      // Check if any documents exist in vector store
      const stats = this.vectorStore.getStats();
      const hasDocuments = stats.totalDocuments > 0;

      // If no documents uploaded, use OpenAI for general questions
      if (!hasDocuments) {
        const client = this._getOpenAIClient();
        if (client) {
          try {
            const response = await client.chat.completions.create({
              model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful medical AI assistant providing educational health information. Always include a disclaimer that this is for educational purposes only and users should consult healthcare professionals.'
                },
                {
                  role: 'user',
                  content: `⚠️ IMPORTANT MEDICAL DISCLAIMER: This information is for educational purposes only and does NOT constitute medical advice. Always consult a qualified healthcare provider.\n\nQuestion: ${query}\n\nPlease provide a comprehensive, educational answer to this medical/health question.`
                }
              ],
              temperature: 0.3,
              max_tokens: 1000
            });

            return {
              success: true,
              response: response.choices[0].message.content,
              sourcesUsed: [],
              confidence: 0.7,
              isDemoMode: false,
              tokensUsed: {
                input: response.usage?.prompt_tokens || 0,
                output: response.usage?.completion_tokens || 0,
                total: response.usage?.total_tokens || 0
              }
            };
          } catch (error) {
            logger.error('OpenAI query failed', error);
          }
        }
        return {
          success: true,
          response: '⚠️ **IMPORTANT MEDICAL DISCLAIMER**\n\nThis information is for educational purposes only and does NOT constitute medical advice. Always consult a qualified healthcare provider.\n\n**OpenAI API is not available.**\n\nPlease configure OPENAI_API_KEY to answer general medical questions, or upload a medical PDF document first to ask questions about it.',
          sourcesUsed: [],
          confidence: 0.0,
          isDemoMode: false,
          tokensUsed: { input: 0, output: 0, total: 0 }
        };
      }

      // If no relevant documents found for query, use OpenAI
      if (retrievedDocs.length === 0) {
        const client = this._getOpenAIClient();
        if (client) {
          try {
            const response = await client.chat.completions.create({
              model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful medical AI assistant providing educational health information. Always include a disclaimer that this is for educational purposes only and users should consult healthcare professionals.'
                },
                {
                  role: 'user',
                  content: `⚠️ IMPORTANT MEDICAL DISCLAIMER: This information is for educational purposes only and does NOT constitute medical advice. Always consult a qualified healthcare provider.\n\nNote: No relevant information found in uploaded documents. Question: ${query}\n\nPlease provide a comprehensive, educational answer to this medical/health question based on general medical knowledge.`
                }
              ],
              temperature: 0.3,
              max_tokens: 1000
            });

            return {
              success: true,
              response: response.choices[0].message.content,
              sourcesUsed: [],
              confidence: 0.7,
              isDemoMode: false,
              tokensUsed: {
                input: response.usage?.prompt_tokens || 0,
                output: response.usage?.completion_tokens || 0,
                total: response.usage?.total_tokens || 0
              }
            };
          } catch (error) {
            logger.error('OpenAI query failed', error);
          }
        }
        return {
          success: true,
          response: '⚠️ **IMPORTANT MEDICAL DISCLAIMER**\n\nThis information is for educational purposes only and does NOT constitute medical advice. Always consult a qualified healthcare provider.\n\n**No relevant information found in uploaded documents and OpenAI API is not available.**\n\nPlease try asking a different question or configure OPENAI_API_KEY.',
          sourcesUsed: [],
          confidence: 0.0,
          isDemoMode: false,
          tokensUsed: { input: 0, output: 0, total: 0 }
        };
      }

      // Generate response from documents
      const response = await this.generateResponse(query, retrievedDocs);

      return response;
    } catch (error) {
      logger.error('Query processing failed', error.message);
      throw error;
    }
  }

  /**
   * Diagnose possible conditions based on symptoms
   * @param {Array|string} symptoms - List of symptoms or comma-separated string
   * @param {Object} options - Required parameters: age, gender, duration (in days)
   * @returns {Promise<Object>} - Full analysis with severity, conditions, recommendations
   */
  async diagnoseSymptoms(symptoms, options = {}) {
    try {
      // Normalize symptoms to array - combine all symptoms into a comprehensive description
      const symptomsList = Array.isArray(symptoms) ? symptoms : (typeof symptoms === 'string' ? [symptoms.trim()] : []);
      
      // Create a comprehensive symptom description that includes all symptoms
      let symptomDescription = '';
      if (symptomsList.length > 0) {
        // If first element contains detailed description and additional symptoms, use it as primary
        if (symptomsList[0].includes('Also experiencing:')) {
          symptomDescription = symptomsList[0];
        } else {
          // Combine all symptoms into a comprehensive description
          symptomDescription = symptomsList.join(' ').trim();
        }
      } else {
        symptomDescription = '';
      }

      // Extract options
      const age = parseInt(options.age) || null;
      const gender = options.gender || null;
      const duration = parseInt(options.duration) || 0; // Duration in days

      logger.info(`Analyzing symptoms: "${symptomDescription}", Age: ${age}, Gender: ${gender}, Duration: ${duration} days`);
      
      // Check for emergency symptoms - will override severity if needed after OpenAI response
      const isEmergencyDetected = detectEmergency(symptomDescription);
      if (isEmergencyDetected) {
        logger.warn(`EMERGENCY DETECTED in symptoms: ${symptomDescription}`);
      }
      
      // ALWAYS call OpenAI to get comprehensive condition analysis for ALL symptoms
      // Don't return early - we need LLM to provide conditions even for simple symptoms like "fever"

      const client = this._getOpenAIClient();
      if (!client) {
        throw new Error('OpenAI API is not available. Please configure OPENAI_API_KEY in environment variables.');
      }

      // Build prompt for OpenAI - ALWAYS provide conditions for ANY symptoms
      const prompt = `You are a medical AI assistant. Analyze the symptoms and ALWAYS provide 5-7 possible conditions with probabilities, regardless of severity level.

**CRITICAL INSTRUCTIONS:**

1. **ALWAYS provide 5-7 possible_conditions** - Even for simple symptoms like "fever" or "headache", list multiple conditions:
   - Example for "fever": Viral infection, Bacterial infection, Influenza, COVID-19, Dengue fever, Urinary tract infection, etc.
   - Example for "stomach ache": Gastroenteritis, Food poisoning, Gastritis, Irritable bowel syndrome, Appendicitis, Kidney stones, etc.
   - Example for "headache": Tension headache, Migraine, Sinusitis, Dehydration, Hypertension, etc.

2. **Emergency Detection:**
If symptoms contain: "internal bleeding", "severe bleeding", "vomiting blood", "blood in stool", "chest pain" + "difficulty breathing", "loss of consciousness", "stroke", "cardiac arrest":
   - severity_score: 90-100
   - risk_level: "EMERGENCY"
   - First recommendation: "🚨 SEEK EMERGENCY MEDICAL CARE IMMEDIATELY"
   - Still provide 5-7 possible conditions related to the emergency

3. **For ANY other symptoms** (even simple ones like "fever", "headache", "stomach ache"):
   - severity_score: Based on symptom severity, age, duration (0-100)
   - risk_level: LOW, MODERATE, HIGH, CRITICAL, or EMERGENCY based on severity
   - **STILL PROVIDE 5-7 POSSIBLE CONDITIONS** with confidence scores

**Patient Information:**
- Age: ${age || 'Not specified'}
- Gender: ${gender || 'Not specified'}  
- Duration: ${duration} days

**SYMPTOMS TO ANALYZE:** "${symptomDescription}"

**Analyze ALL symptoms together and provide comprehensive condition list:**

**Response Format (JSON only):**
{
  "severity_score": <number 0-100>,
  "risk_level": "<LOW|MODERATE|HIGH|CRITICAL|EMERGENCY>",
  "possible_conditions": [
    {
      "condition": "<clean condition name WITHOUT emojis or prefixes>",
      "confidence": <0.0-1.0 probability>,
      "rationale": "<brief explanation>"
    }
  ],
  "recommendations": ["<action 1>", "<action 2>", ...]
}

**CRITICAL RULES:**
1. **ALWAYS provide 5-7 possible_conditions** - Never return fewer than 5, even for simple symptoms
2. Condition names should be clean medical terms (e.g., "Gastroenteritis" not "⚠️ EMERGENCY: Gastroenteritis")
3. Confidence scores should reflect probability (0.0-1.0, higher = more likely)
4. Analyze symptom COMBINATIONS, not individual symptoms
5. Consider patient age, gender, and duration when suggesting conditions
6. If "internal bleeding" appears ANYWHERE, severity_score = 90-100, risk_level = "EMERGENCY"
7. Rank conditions by probability (highest confidence first)

Return ONLY valid JSON, no markdown, no extra text.`;

      // Call OpenAI API
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful medical AI assistant providing educational health information. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const content = response.choices[0].message.content.trim();
      
      // Parse JSON response
      let analysis;
      try {
        // Try to extract JSON if wrapped in markdown code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
        analysis = JSON.parse(jsonMatch ? jsonMatch[1] : content);
      } catch (parseError) {
        logger.error('Failed to parse OpenAI response as JSON', parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      // Validate and format response
      // Ensure we have conditions - if empty or too few, this is an error
      let conditions = analysis.possible_conditions || [];
      
      // If no conditions provided, this is a problem
      if (conditions.length === 0) {
        logger.error('OpenAI returned no possible conditions');
        throw new Error('Failed to generate possible conditions. Please try again.');
      }

      // Double-check for emergency keywords - override if needed
      if (isEmergencyDetected && (analysis.risk_level !== 'EMERGENCY' && analysis.risk_level !== 'CRITICAL')) {
        logger.warn('Emergency detected but AI did not flag as emergency, overriding response');
        analysis.severity_score = 95;
        analysis.risk_level = 'EMERGENCY';
        
        // Update first recommendation if not emergency
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          if (!analysis.recommendations[0].includes('EMERGENCY')) {
            analysis.recommendations.unshift('🚨 SEEK EMERGENCY MEDICAL CARE IMMEDIATELY');
          }
        } else {
          analysis.recommendations = [
            '🚨 SEEK EMERGENCY MEDICAL CARE IMMEDIATELY',
            'Call emergency services (911) or go to nearest ER',
            'Do not delay - seek immediate medical evaluation',
            'Do not drive yourself - have someone take you or call an ambulance'
          ];
        }
      }

      // Ensure we have at least 3-5 conditions, prefer 5-7
      if (conditions.length < 3) {
        logger.warn(`Only ${conditions.length} conditions returned, expected at least 3`);
      }

      // Clean condition names (remove emojis and emergency prefixes)
      conditions = conditions.map(cond => ({
        ...cond,
        condition: cond.condition.replace(/⚠️|EMERGENCY:|CRITICAL:/gi, '').trim()
      }));

      return {
        success: true,
        severity_score: Math.min(100, Math.max(0, analysis.severity_score || 50)),
        risk_level: analysis.risk_level || 'MODERATE',
        possible_conditions: conditions.slice(0, 7), // Return up to 7 conditions
        recommendations: analysis.recommendations || ['Consult a healthcare professional for proper diagnosis'],
        symptoms_analyzed: symptomsList,
        disclaimer: 'This is for educational purposes only. Always consult a healthcare professional for proper diagnosis.',
        isDemoMode: false,
        isEmergency: isEmergencyDetected
      };
    } catch (error) {
      logger.error('Diagnosis failed', error.message);
      throw error;
    }
  }

  /**
   * Generate general knowledge response when no documents are available
   * @param {string} query - User query
   * @returns {Object} - Response object
   */
  _generateGeneralResponse(query) {
    const queryLower = query.toLowerCase();
    let response = '';
    let confidence = 0.6;

    // Medical knowledge base (general information)
    const medicalKnowledge = {
      'fever': {
        info: 'Fever is a temporary increase in body temperature, often due to an illness. A fever is generally defined as a temperature above 100.4°F (38°C). It is a natural response of the immune system to fight infections.',
        causes: ['Viral infections (flu, cold, COVID-19)', 'Bacterial infections', 'Heat exhaustion', 'Inflammatory conditions', 'Some medications'],
        treatment: ['Rest and stay hydrated', 'Take fever-reducing medications (acetaminophen, ibuprofen)', 'Use cool compresses', 'Wear light clothing', 'Seek medical care if fever exceeds 103°F or lasts more than 3 days']
      },
      'headache': {
        info: 'Headaches are pain in any region of the head. They can occur on one or both sides of the head, be isolated to a certain location, or radiate across the head.',
        causes: ['Tension and stress', 'Dehydration', 'Lack of sleep', 'Eye strain', 'Migraines', 'Sinus infections'],
        treatment: ['Rest in a quiet, dark room', 'Stay hydrated', 'Over-the-counter pain relievers', 'Apply cold or warm compress', 'Manage stress']
      },
      'cough': {
        info: 'A cough is a reflex action to clear your airways of mucus, irritants, and foreign particles. It can be dry or productive (with phlegm).',
        causes: ['Common cold', 'Flu', 'Allergies', 'Asthma', 'Bronchitis', 'COVID-19', 'Smoking'],
        treatment: ['Stay hydrated', 'Use honey (for adults)', 'Try cough drops', 'Use a humidifier', 'Avoid irritants', 'See a doctor if cough persists beyond 3 weeks']
      },
      'dengue': {
        info: 'Dengue is a mosquito-borne viral infection causing flu-like illness. It is transmitted by Aedes mosquitoes and is common in tropical regions.',
        causes: ['Bite from infected Aedes aegypti mosquito', 'Four different dengue virus serotypes (DENV-1 to DENV-4)'],
        symptoms: ['High fever', 'Severe headache', 'Pain behind eyes', 'Muscle and joint pain', 'Nausea and vomiting', 'Skin rash', 'Mild bleeding'],
        treatment: ['No specific treatment - supportive care', 'Rest and hydration', 'Acetaminophen for pain (avoid aspirin/ibuprofen)', 'Monitor for warning signs', 'Seek emergency care if severe bleeding or shock occurs']
      },
      'diabetes': {
        info: 'Diabetes is a chronic condition affecting how your body processes blood sugar (glucose). Type 1 is autoimmune, Type 2 is related to insulin resistance.',
        symptoms: ['Increased thirst', 'Frequent urination', 'Extreme hunger', 'Unexplained weight loss', 'Fatigue', 'Blurred vision'],
        treatment: ['Blood sugar monitoring', 'Insulin therapy (Type 1)', 'Oral medications (Type 2)', 'Healthy diet', 'Regular exercise', 'Regular check-ups']
      },
      'cold': {
        info: 'The common cold is a viral infection of the upper respiratory tract. It is usually harmless and resolves within 7-10 days.',
        symptoms: ['Runny or stuffy nose', 'Sore throat', 'Cough', 'Sneezing', 'Mild body aches', 'Low-grade fever'],
        treatment: ['Rest', 'Stay hydrated', 'Warm liquids', 'Over-the-counter cold medications', 'Saltwater gargle', 'Humidifier']
      },
      'covid': {
        info: 'COVID-19 is a respiratory illness caused by the SARS-CoV-2 virus. Symptoms range from mild to severe.',
        symptoms: ['Fever', 'Cough', 'Fatigue', 'Loss of taste or smell', 'Shortness of breath', 'Body aches'],
        treatment: ['Isolate to prevent spread', 'Rest and hydration', 'Over-the-counter medications for symptoms', 'Seek medical care if breathing difficulty occurs', 'Follow local health guidelines']
      }
    };

    // Find matching topic
    let matchedTopic = null;
    for (const [topic, data] of Object.entries(medicalKnowledge)) {
      if (queryLower.includes(topic)) {
        matchedTopic = { topic, data };
        break;
      }
    }

    if (matchedTopic) {
      const { topic, data } = matchedTopic;
      response = `⚠️ **MEDICAL DISCLAIMER**\nThis information is for educational purposes only. Always consult a healthcare professional.\n\n`;
      response += `**About ${topic.charAt(0).toUpperCase() + topic.slice(1)}:**\n${data.info}\n\n`;
      
      if (data.causes) {
        response += `**Common Causes:**\n${data.causes.map(c => `• ${c}`).join('\n')}\n\n`;
      }
      if (data.symptoms) {
        response += `**Symptoms:**\n${data.symptoms.map(s => `• ${s}`).join('\n')}\n\n`;
      }
      if (data.treatment) {
        response += `**Treatment & Management:**\n${data.treatment.map(t => `• ${t}`).join('\n')}\n\n`;
      }
      
      response += `**When to See a Doctor:**\n• If symptoms are severe or worsening\n• If symptoms persist beyond expected duration\n• If you have underlying health conditions\n• If you experience any emergency symptoms`;
      confidence = 0.75;
    } else {
      // Generic response for unknown queries
      response = `⚠️ **MEDICAL DISCLAIMER**\nThis information is for educational purposes only. Always consult a healthcare professional.\n\n`;
      response += `**Regarding your question: "${query}"**\n\n`;
      response += `I don't have specific information about this topic in my knowledge base. For accurate medical information, please:\n\n`;
      response += `• Consult a qualified healthcare provider\n`;
      response += `• Visit reputable medical websites (WHO, CDC, Mayo Clinic)\n`;
      response += `• Upload relevant medical documents to enhance my knowledge\n\n`;
      response += `**General Health Recommendations:**\n`;
      response += `• Maintain a healthy lifestyle with balanced diet and exercise\n`;
      response += `• Get adequate sleep (7-9 hours for adults)\n`;
      response += `• Stay hydrated\n`;
      response += `• Schedule regular health check-ups\n`;
      response += `• Seek immediate care for any emergency symptoms`;
      confidence = 0.4;
    }

    return {
      success: true,
      response: response,
      sourcesUsed: [],
      confidence: confidence,
      isDemoMode: false,
      tokensUsed: { input: 0, output: 0, total: 0 }
    };
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
