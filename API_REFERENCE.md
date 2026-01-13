# MediOracle AI - Complete API Reference

## Base URLs

- **Backend**: `http://localhost:5000/api`
- **FastAPI**: `http://localhost:8000`

---

## 🏥 Health & Information Endpoints

### GET /health
Check backend health status

**Response:**
```json
{
  "status": "ok",
  "service": "MediOracle AI - RAG Backend",
  "timestamp": "2024-01-13T10:30:00Z",
  "uptime": 1234.56
}
```

### GET /info
Get API information and disclaimer

**Response:**
```json
{
  "service": "MediOracle AI Backend",
  "version": "1.0.0",
  "status": "running",
  "disclaimer": "⚠️ IMPORTANT MEDICAL DISCLAIMER...",
  "endpoints": {...}
}
```

---

## 📚 RAG Pipeline Endpoints

### POST /rag/ingest
Upload and ingest medical PDF

**Request:**
```
Content-Type: multipart/form-data
Body: file (PDF file)
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/rag/ingest \
  -F "file=@medical.pdf"
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "fileName": "medical.pdf",
    "fileSize": 1024000,
    "numPages": 150,
    "chunksCreated": 342,
    "validationResult": {
      "isMedicalContent": true,
      "relevanceScore": 95,
      "foundKeywords": [...]
    },
    "vectorStoreStats": {
      "totalDocuments": 342,
      "totalChunks": 342,
      "sources": ["medical.pdf"]
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "File must be a PDF"
}
```

---

### POST /rag/query
Query the medical knowledge base with RAG

**Request:**
```json
{
  "query": "What are the symptoms of diabetes?"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the symptoms of diabetes?"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "response": "Based on the medical knowledge base, diabetes commonly presents with...",
    "sourcesUsed": [
      {
        "source": "medical.pdf",
        "similarity": 0.892,
        "excerpt": "Diabetes is a chronic condition..."
      }
    ],
    "confidence": 0.8,
    "tokensUsed": {
      "input": 245,
      "output": 512
    }
  }
}
```

**Response (No Results):**
```json
{
  "success": true,
  "data": {
    "response": "I could not find relevant medical information...",
    "sourcesUsed": [],
    "confidence": 0.0
  }
}
```

---

### GET /rag/stats
Get vector store and pipeline statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "vectorStoreStats": {
      "totalDocuments": 342,
      "totalChunks": 342,
      "sources": ["medical.pdf", "health_guide.pdf"]
    },
    "chunkerConfig": {
      "chunkSize": 500,
      "overlap": 100
    },
    "embeddingModel": {
      "modelName": "text-embedding-3-small",
      "dimension": 1536,
      "initialized": true
    }
  }
}
```

---

### DELETE /rag/clear
Clear all documents from vector store

**Response:**
```json
{
  "success": true,
  "message": "Vector store cleared"
}
```

---

## 🏥 Medical Analysis Endpoints

### POST /medical/symptoms
Analyze symptoms and get severity score

**Request:**
```json
{
  "symptoms": ["fever", "cough", "fatigue"],
  "age": 35,
  "gender": "M",
  "duration": "3 days"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough"],
    "age": 35,
    "gender": "M"
  }'
```

**Response:**
```json
{
  "severity_score": 65,
  "risk_level": "MEDIUM",
  "is_emergency": false,
  "symptoms_analysis": {
    "fever": "Elevated body temperature may indicate infection",
    "cough": "Respiratory symptom that may indicate viral/bacterial infection"
  },
  "recommendations": [
    "Consult a qualified healthcare provider",
    "Keep track of symptom progression",
    "Follow basic health precautions (hygiene, rest, hydration)"
  ],
  "disclaimer": "⚠️ IMPORTANT MEDICAL DISCLAIMER..."
}
```

**Response (Emergency Detected):**
```json
{
  "is_emergency": true,
  "severity_score": 100,
  "risk_level": "CRITICAL",
  "message": "🚨 EMERGENCY DETECTED 🚨\n\nYour symptoms may indicate a medical emergency.\n\n📞 CALL 911 IMMEDIATELY or go to the nearest emergency room.",
  "disclaimer": "..."
}
```

---

### POST /medical/analyze
Detailed medical analysis with medical history

**Request:**
```json
{
  "symptoms": "persistent headache with dizziness",
  "medical_history": ["hypertension", "migraines"],
  "current_medications": ["lisinopril", "ibuprofen"]
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "fever and severe headache",
    "medical_history": ["diabetes"],
    "current_medications": ["metformin"]
  }'
```

**Response:**
```json
{
  "symptom_assessment": "Combination of headache and dizziness warrants evaluation...",
  "possible_conditions": [
    {
      "condition": "Tension headache",
      "likelihood": "moderate",
      "info": "Common type of headache"
    },
    {
      "condition": "Migraine",
      "likelihood": "low",
      "info": "Severe type of headache"
    }
  ],
  "severity_level": "MEDIUM",
  "recommended_actions": [
    "Monitor blood pressure",
    "Stay hydrated",
    "Rest in quiet environment"
  ],
  "risk_factors": [
    "Existing hypertension",
    "Currently taking: lisinopril"
  ],
  "when_to_seek_help": [
    "Symptoms worsen",
    "Difficulty breathing",
    "Loss of consciousness"
  ],
  "disclaimer": "..."
}
```

---

## 🔐 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Query cannot be empty"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message (development only)"
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "error": "Medical analysis service is currently unavailable"
}
```

---

## 📊 Request Examples

### Example 1: Complete RAG Workflow

```bash
#!/bin/bash

# 1. Upload PDF
echo "Uploading medical PDF..."
curl -X POST http://localhost:5000/api/rag/ingest \
  -F "file=@medical_handbook.pdf"

# 2. Query knowledge base
echo "Querying knowledge base..."
curl -X POST http://localhost:5000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the symptoms of diabetes?"
  }'

# 3. Check stats
echo "Getting pipeline stats..."
curl http://localhost:5000/api/rag/stats
```

### Example 2: Symptom Analysis Workflow

```bash
#!/bin/bash

# Analyze symptoms
curl -X POST http://localhost:8000/api/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough", "sore throat"],
    "age": 28,
    "gender": "F",
    "duration": "2 days"
  }' | jq '.data'
```

### Example 3: Detailed Medical Analysis

```bash
#!/bin/bash

# Detailed analysis with medical history
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "persistent fatigue and weight loss",
    "medical_history": ["diabetes", "thyroid disorder"],
    "current_medications": ["levothyroxine", "metformin"]
  }' | jq '.data'
```

---

## 🧪 Testing with Postman

### Import Collection

1. Open Postman
2. Import from URL or create new collection
3. Add requests:

**Health Check**
- Method: GET
- URL: `http://localhost:5000/api/health`

**Query RAG**
- Method: POST
- URL: `http://localhost:5000/api/rag/query`
- Body (JSON):
  ```json
  {
    "query": "Your medical question here"
  }
  ```

**Analyze Symptoms**
- Method: POST
- URL: `http://localhost:8000/api/analyze-symptoms`
- Body (JSON):
  ```json
  {
    "symptoms": ["symptom1", "symptom2"],
    "age": 30,
    "gender": "M"
  }
  ```

---

## 🔍 Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Endpoint doesn't exist |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - FastAPI down |

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Confidence scores range from 0.0 to 1.0
- Severity scores range from 0 to 100
- All responses include medical disclaimers
- Emergency detection is automatic and always prioritized

---

## 🆘 Common Issues

### CORS Error
- Ensure all services are running
- Check URLs in frontend `.env`
- Browser console shows exact error

### Empty Results
- Ensure PDF has been uploaded
- Check vector store stats with GET /rag/stats
- Try simpler queries first

### Slow Responses
- First query with new PDF is slower (embedding generation)
- Subsequent queries are faster (cached embeddings)
- Check OpenAI API rate limits

---

**⚠️ Medical Disclaimer**: This API provides educational information only. It is NOT a substitute for professional medical advice. Always consult qualified healthcare providers.
