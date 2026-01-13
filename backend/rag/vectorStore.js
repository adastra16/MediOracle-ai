/**
 * Vector Store - In-memory vector database for embeddings
 * Stores document chunks with their embeddings and metadata
 */

class VectorStore {
  constructor() {
    // Array of documents with embeddings and metadata
    this.documents = [];
    this.embeddings = [];
  }

  /**
   * Add a document chunk with embedding
   * @param {string} content - Document content
   * @param {Array} embedding - Vector embedding
   * @param {Object} metadata - Document metadata (source, page, etc.)
   */
  addDocument(content, embedding, metadata = {}) {
    this.documents.push({
      id: this.documents.length,
      content,
      embedding,
      metadata: {
        source: metadata.source || 'unknown',
        page: metadata.page || 0,
        chunkIndex: metadata.chunkIndex || 0,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {Array} vecA - First vector
   * @param {Array} vecB - Second vector
   * @returns {number} - Similarity score (0-1)
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions must match');
    }

    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Retrieve similar documents using semantic search
   * @param {Array} queryEmbedding - Query vector
   * @param {number} topK - Number of results to return
   * @param {number} threshold - Minimum similarity score
   * @returns {Array} - Retrieved documents with similarity scores
   */
  search(queryEmbedding, topK = 5, threshold = 0.7) {
    if (this.documents.length === 0) {
      return [];
    }

    // Calculate similarity for all documents
    const results = this.documents.map(doc => ({
      ...doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    // Filter by threshold and sort by similarity
    return results
      .filter(doc => doc.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(({ similarity, embedding, ...rest }) => ({
        ...rest,
        similarity
      }));
  }

  /**
   * Get all documents count
   * @returns {number}
   */
  getDocumentCount() {
    return this.documents.length;
  }

  /**
   * Clear all documents
   */
  clear() {
    this.documents = [];
  }

  /**
   * Get document statistics
   * @returns {Object}
   */
  getStats() {
    return {
      totalDocuments: this.documents.length,
      totalChunks: this.documents.length,
      sources: [...new Set(this.documents.map(d => d.metadata.source))]
    };
  }
}

export default VectorStore;
