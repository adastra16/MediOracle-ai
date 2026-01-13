import React, { useState, useEffect } from 'react';
import PDFUpload from './components/PDFUpload';
import RAGQuery from './components/RAGQuery';
import SymptomAnalyzer from './components/SymptomAnalyzer';
import { healthAPI } from './api/client';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('rag');
  const [serverStatus, setServerStatus] = useState('checking');
  const [apiInfo, setApiInfo] = useState(null);

  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      await healthAPI.checkHealth();
      setServerStatus('online');
      
      // Get API info
      const infoResponse = await healthAPI.getInfo();
      setApiInfo(infoResponse.data);
    } catch (error) {
      setServerStatus('offline');
      console.error('Server connection error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                🏥 MediOracle AI
              </h1>
              <p className="text-gray-600 mt-1">
                Intelligent Healthcare Assistant powered by LLM + RAG
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-semibold text-gray-600">
                {serverStatus === 'online' ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Medical Disclaimer Banner */}
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded">
        <div className="flex gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-sm text-red-900">
            <p className="font-bold">IMPORTANT: Medical Disclaimer</p>
            <p className="mt-1">
              This tool provides educational information only and is NOT a substitute for professional medical advice.
              Always consult with qualified healthcare providers for diagnosis and treatment. In case of emergency, call 911 immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {serverStatus === 'offline' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-900 font-semibold">
              ⚠️ Backend server is not available. Please ensure the Node.js and FastAPI servers are running.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('rag')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'rag'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📚 Knowledge Base Q&A
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'symptoms'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            🏥 Symptom Analyzer
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'rag' && (
            <>
              <PDFUpload />
              <RAGQuery />
            </>
          )}

          {activeTab === 'symptoms' && <SymptomAnalyzer />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>
            <strong>MediOracle AI v1.0.0</strong> - Powered by LLM + RAG with Medical Safety Guardrails
          </p>
          <p className="mt-2 text-xs">
            ⚠️ This is an educational tool. Always consult healthcare professionals for medical decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
