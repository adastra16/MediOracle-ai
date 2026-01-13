/**
 * PDF Ingestion Service
 * Handles PDF upload, text extraction, and processing
 */

import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

class PDFIngestionService {
  /**
   * Extract text from PDF buffer
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async extractTextFromPDF(pdfBuffer) {
    try {
      const data = await pdfParse(pdfBuffer);

      return {
        text: data.text,
        numPages: data.numpages,
        metadata: data.info,
        success: true
      };
    } catch (error) {
      logger.error('PDF extraction failed', error.message);
      throw new Error(`Failed to extract PDF: ${error.message}`);
    }
  }

  /**
   * Process PDF file from upload
   * @param {Object} file - Express multer file object
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async processPDFFile(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.mimetype.includes('pdf')) {
      throw new Error('File must be a PDF');
    }

    try {
      const buffer = file.buffer;
      const extraction = await this.extractTextFromPDF(buffer);

      return {
        ...extraction,
        fileName: file.originalname,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('PDF processing failed', error.message);
      throw error;
    }
  }

  /**
   * Validate PDF content for medical relevance
   * @param {string} text - Extracted PDF text
   * @returns {Object} - Validation result
   */
  validateMedicalContent(text) {
    const medicalKeywords = [
      'treatment',
      'symptom',
      'disease',
      'diagnosis',
      'patient',
      'medical',
      'health',
      'clinical',
      'therapy',
      'medication'
    ];

    const lowerText = text.toLowerCase();
    const foundKeywords = medicalKeywords.filter(keyword =>
      lowerText.includes(keyword)
    );

    const relevanceScore = foundKeywords.length / medicalKeywords.length;

    return {
      isMedicalContent: relevanceScore > 0.2,
      relevanceScore: Math.round(relevanceScore * 100),
      foundKeywords,
      warning: relevanceScore <= 0.2
        ? 'Content may not be medical-related. Verify before proceeding.'
        : null
    };
  }

  /**
   * Clean and preprocess extracted text
   * @param {string} text - Raw extracted text
   * @returns {string} - Cleaned text
   */
  cleanText(text) {
    return text
      .replace(/\n\n+/g, '\n') // Remove excessive newlines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract text by page for better chunking
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @returns {Promise<Array>} - Array of page texts
   */
  async extractTextByPage(pdfBuffer) {
    try {
      const data = await pdfParse(pdfBuffer);
      // Note: pdf-parse doesn't provide page-level extraction by default
      // This returns the full text as a single page
      return [data.text];
    } catch (error) {
      logger.error('Page extraction failed', error.message);
      throw error;
    }
  }
}

export default new PDFIngestionService();
