import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const ragAPI = {
  // Upload PDF for ingestion
  ingestPDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/rag/ingest', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Query the RAG pipeline
  query: async (query) => {
    return api.post('/rag/query', { query });
  },

  // Get pipeline statistics
  getStats: async () => {
    return api.get('/rag/stats');
  },

  // Diagnose symptoms using RAG + LLM
  diagnoseSymptoms: async (symptoms, age, gender) => {
    return api.post('/rag/diagnose', { symptoms, age, gender });
  },

  // Clear vector store
  clear: async () => {
    return api.delete('/rag/clear');
  }
};

export const medicalAPI = {
  // Analyze symptoms
  analyzeSymptoms: async (symptoms, age, gender, duration) => {
    return api.post('/medical/symptoms', {
      symptoms,
      age,
      gender,
      duration
    });
  },

  // Detailed medical analysis
  analyze: async (symptoms, medicalHistory, currentMedications) => {
    return api.post('/medical/analyze', {
      symptoms,
      medical_history: medicalHistory,
      current_medications: currentMedications
    });
  }
};

export const healthAPI = {
  // Get health status
  checkHealth: async () => {
    return api.get('/health');
  },

  // Get API information
  getInfo: async () => {
    return api.get('/info');
  }
};

export default api;
