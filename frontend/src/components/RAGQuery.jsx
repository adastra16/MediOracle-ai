import React, { useState } from 'react';
import { ragAPI } from '../api/client';

export default function RAGQuery() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await ragAPI.query(query);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">❓ Ask Medical Questions</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Your Question
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="Ask a medical question (e.g., 'What are the symptoms of diabetes?')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            rows="4"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          {loading ? 'Processing...' : '🔍 Search Knowledge Base'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-semibold">❌ Error</p>
          <p>{error}</p>
        </div>
      )}

      {result?.data && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 mb-3">
              <span className="text-2xl">📌</span>
              <div>
                <p className="text-gray-700 whitespace-pre-wrap font-semibold">
                  {result.data.response}
                </p>
              </div>
            </div>

            {/* Confidence Indicator */}
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Confidence:</strong> {(result.data.confidence * 100).toFixed(0)}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    result.data.confidence > 0.8
                      ? 'bg-green-500'
                      : result.data.confidence > 0.5
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${result.data.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sources */}
          {result.data.sourcesUsed?.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-semibold text-gray-800 mb-2">📚 Sources Used:</p>
              <div className="space-y-2">
                {result.data.sourcesUsed.map((source, idx) => (
                  <div key={idx} className="text-sm text-gray-700 bg-white p-2 rounded">
                    <p><strong>{idx + 1}. {source.source}</strong></p>
                    <p className="text-xs text-gray-600">Similarity: {source.similarity}</p>
                    <p className="text-xs italic mt-1">{source.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-900">
            <p className="font-semibold">⚠️ Medical Disclaimer</p>
            <p className="mt-1">
              This information is educational only and not a substitute for professional medical advice.
              Always consult with a qualified healthcare provider for diagnosis and treatment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
