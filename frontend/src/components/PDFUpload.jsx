import React, { useState, useRef } from 'react';
import { ragAPI } from '../api/client';

export default function PDFUpload() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await ragAPI.ingestPDF(file);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload PDF');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 Upload Medical PDF</h2>
      
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
          id="pdf-input"
        />
        
        <label htmlFor="pdf-input" className="cursor-pointer block">
          <div className="text-4xl mb-2">📑</div>
          <p className="text-gray-700 font-semibold mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-gray-500 text-sm">PDF files only (max 50MB)</p>
        </label>
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Processing PDF...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-semibold">❌ Error</p>
          <p>{error}</p>
        </div>
      )}

      {result?.data && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-semibold text-green-700 mb-2">✅ PDF Uploaded Successfully</p>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>File:</strong> {result.data.fileName}</p>
            <p><strong>Pages:</strong> {result.data.numPages}</p>
            <p><strong>Chunks Created:</strong> {result.data.chunksCreated}</p>
            <p><strong>Relevance Score:</strong> {result.data.validationResult.relevanceScore}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
