import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// FastAPI instance
const fastApi = axios.create({
  baseURL: FASTAPI_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API] Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// RAG Query API
export const queryRAG = async (query) => {
  try {
    const response = await api.post('/rag/query', { query });
    return response.data;
  } catch (error) {
    console.error('RAG query error:', error);
    throw error;
  }
};

// Document Upload API
export const uploadDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await api.post('/rag/ingest', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Document upload error:', error);
    throw error;
  }
};

// Symptom Analysis API (FastAPI)
export const analyzeSymptoms = async (data) => {
  try {
    const response = await fastApi.post('/analyze', data);
    return response.data;
  } catch (error) {
    console.error('Symptom analysis error:', error);
    // Fallback to Node.js backend if FastAPI is unavailable
    try {
      const fallbackResponse = await api.post('/rag/diagnose', data);
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error('Fallback analysis error:', fallbackError);
      throw error;
    }
  }
};

// Health check
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

// Get RAG statistics
export const getRAGStats = async () => {
  try {
    const response = await api.get('/rag/stats');
    return response.data;
  } catch (error) {
    console.error('RAG stats error:', error);
    throw error;
  }
};

export default {
  queryRAG,
  uploadDocument,
  analyzeSymptoms,
  checkHealth,
  getRAGStats,
};

