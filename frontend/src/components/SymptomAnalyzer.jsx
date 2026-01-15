import React, { useState } from 'react';
import { medicalAPI } from '../api/client';

export default function SymptomAnalyzer() {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-red-100 border-red-300 text-red-900';
      case 'HIGH':
        return 'bg-orange-100 border-orange-300 text-orange-900';
      case 'MEDIUM':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';
      case 'LOW':
        return 'bg-green-100 border-green-300 text-green-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      setError('Please enter at least one symptom');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const symptomsList = symptoms
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await medicalAPI.analyzeSymptoms(
        symptomsList,
        age ? parseInt(age) : null,
        gender || null,
        duration || null
      );

      let mergedResult = response.data;

      // Augment with RAG+LLM diagnosis if available
      try {
        const ragResp = await ragAPI.diagnoseSymptoms(symptomsList, age ? parseInt(age) : null, gender || null);
        if (ragResp?.data?.possible_conditions) {
          mergedResult.possible_conditions = ragResp.data.possible_conditions;
          mergedResult.rag_sources = ragResp.data.sources || [];
          mergedResult.rag_is_demo = ragResp.data.isDemoMode;
        }
      } catch (ragErr) {
        // Non-fatal; keep original result
        console.warn('RAG diagnosis failed', ragErr);
      }

      setResult(mergedResult);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🏥 Symptom Analyzer</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Symptoms Input */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Symptoms (comma-separated)
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={loading}
            placeholder="e.g., fever, cough, fatigue"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            rows="3"
          />
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Age (Optional)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={loading}
              placeholder="25"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Gender (Optional)</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Duration (Optional)</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={loading}
              placeholder="e.g., 3 days"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          {loading ? 'Analyzing...' : '🔬 Analyze Symptoms'}
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
          {/* Emergency Alert */}
          {result.data.is_emergency && (
            <div className="p-4 bg-red-100 border-2 border-red-500 rounded-lg">
              <p className="text-lg font-bold text-red-900">🚨 EMERGENCY DETECTED 🚨</p>
              <p className="text-red-900 mt-2">
                Your symptoms may indicate a medical emergency.
              </p>
              <p className="text-red-900 font-bold mt-2">
                📞 CALL 911 IMMEDIATELY or go to the nearest emergency room.
              </p>
            </div>
          )}

          {/* Risk Assessment */}
          <div className={`p-4 border rounded-lg ${getRiskColor(result.data.risk_level)}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold mb-2">Risk Assessment</p>
                <p className="text-sm">
                  <strong>Risk Level:</strong> {result.data.risk_level}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{result.data.severity_score}</p>
                <p className="text-xs">Severity Score</p>
              </div>
            </div>

            {/* Severity Bar */}
            <div className="mt-3 w-full bg-gray-300 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  result.data.severity_score >= 80
                    ? 'bg-red-500'
                    : result.data.severity_score >= 50
                    ? 'bg-orange-500'
                    : result.data.severity_score >= 25
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${result.data.severity_score}%` }}
              />
            </div>
          </div>

          {/* Symptoms Analysis */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="font-semibold mb-3">📋 Symptom Analysis</p>
            <div className="space-y-2">
              {Object.entries(result.data.symptoms_analysis).map(([symptom, analysis]) => (
                <div key={symptom} className="p-2 bg-white rounded border-l-4 border-blue-400">
                  <p className="font-semibold text-gray-800">{symptom}</p>
                  <p className="text-sm text-gray-600">{analysis}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Possible Conditions */}
          {result.data.possible_conditions && result.data.possible_conditions.length > 0 && (
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <p className="font-semibold mb-3">🩺 Possible Conditions (Educational)</p>
              <div className="space-y-2">
                {result.data.possible_conditions.map((cnd, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded border-l-4 border-indigo-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{cnd.condition}</p>
                        {cnd.rationale && (
                          <p className="text-sm text-gray-600">{cnd.rationale}</p>
                        )}
                        {cnd.info && (
                          <p className="text-sm text-gray-600">{cnd.info}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{(cnd.confidence || cnd.likelihood || cnd.confidence === 0) ? `${Math.round((cnd.confidence || (cnd.likelihood === 'high' ? 0.8 : cnd.likelihood === 'moderate' ? 0.6 : 0.4)) * 100)}%` : ''}</p>
                        <p className="text-xs text-gray-500">confidence</p>
                      </div>
                    </div>

                    {cnd.sources && cnd.sources.length > 0 && (
                      <details className="mt-2 text-sm text-gray-600">
                        <summary className="font-medium">Sources / Evidence</summary>
                        <ul className="mt-2 list-disc list-inside">
                          {cnd.sources.map((s, i) => (
                            <li key={i} className="text-xs text-gray-600">{s.source}: {s.excerpt ? `${s.excerpt.substring(0, 120)}...` : ''}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold mb-3">💡 Recommendations</p>
            <ul className="space-y-2">
              {result.data.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Medical Disclaimer */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-900">
            <p className="font-semibold">⚠️ Medical Disclaimer</p>
            <p className="mt-1">
              This analysis is for educational purposes only. It is NOT medical advice and should NOT
              replace professional medical consultation. Always seek proper medical evaluation from qualified
              healthcare providers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
