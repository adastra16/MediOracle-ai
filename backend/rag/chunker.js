/**
 * Document Chunker - Splits documents into manageable chunks
 * Implements sliding window chunking strategy
 */

class DocumentChunker {
  constructor(chunkSize = 500, overlap = 100) {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
  }

  /**
   * Split text into chunks with overlap
   * @param {string} text - Full document text
   * @param {string} source - Source file name
   * @returns {Array} - Array of chunk objects
   */
  chunkText(text, source = 'unknown') {
    const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();

      // Add sentence to current chunk
      if ((currentChunk + sentence).length <= this.chunkSize) {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      } else {
        // Save current chunk if it has content
        if (currentChunk) {
          chunks.push({
            content: currentChunk,
            index: chunkIndex,
            source,
            startChar: text.indexOf(currentChunk),
            endChar: text.indexOf(currentChunk) + currentChunk.length
          });
          chunkIndex++;
        }

        // Start new chunk with overlap
        const overlapSentences = this.calculateOverlap(sentences, i);
        currentChunk = overlapSentences + (overlapSentences ? ' ' : '') + sentence;
      }
    }

    // Add final chunk
    if (currentChunk) {
      chunks.push({
        content: currentChunk,
        index: chunkIndex,
        source,
        startChar: text.indexOf(currentChunk),
        endChar: text.indexOf(currentChunk) + currentChunk.length
      });
    }

    return chunks;
  }

  /**
   * Calculate overlap sentences for sliding window
   * @param {Array} sentences - Array of sentences
   * @param {number} currentIndex - Current sentence index
   * @returns {string} - Overlapping text
   */
  calculateOverlap(sentences, currentIndex) {
    let overlapText = '';
    let charCount = 0;

    for (let i = currentIndex - 1; i >= 0 && charCount < this.overlap; i--) {
      const sentence = sentences[i].trim();
      overlapText = sentence + ' ' + overlapText;
      charCount += sentence.length;
    }

    return overlapText.trim();
  }

  /**
   * Chunk multiple documents
   * @param {Array} documents - Array of {text, source} objects
   * @returns {Array} - Flattened array of all chunks
   */
  chunkDocuments(documents) {
    return documents.flatMap(doc =>
      this.chunkText(doc.text, doc.source)
    );
  }

  /**
   * Get chunking configuration
   * @returns {Object}
   */
  getConfig() {
    return {
      chunkSize: this.chunkSize,
      overlap: this.overlap
    };
  }
}

export default DocumentChunker;
