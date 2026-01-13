# MediOracle AI - Intelligent Healthcare Assistant

A production-ready healthcare AI system combining **LLM + RAG (Retrieval Augmented Generation)** with medical safety guardrails.

## 🏥 Features

### RAG-Powered Knowledge Base
- **PDF Ingestion**: Upload medical documents and PDFs
- **Semantic Search**: Retrieve relevant medical information
- **LLM Generation**: Generate safe, evidence-based responses
- **Citation Tracking**: Know which documents informed the response

### Symptom Analysis Engine
- **Symptom Severity Scoring**: 0-100 scale severity assessment
- **Risk Classification**: LOW / MEDIUM / HIGH / CRITICAL levels
- **Emergency Detection**: Automatic emergency scenario detection
- **Medical Guardrails**: Prevents dangerous medical claims

### Safety-First Design
- ⚠️ Medical disclaimers on every response
- 🚨 Emergency keyword detection
- ✅ No diagnostic claims (educational only)
- 📋 Professional consultation recommendations
- 🔒 Built-in medical safety constraints

## 🏗️ Architecture

```
MediOracle AI/
├── frontend/                    # React + Vite UI
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── api/                # API client
│   │   └── pages/              # Page layouts
│   └── package.json
│
├── backend/                     # Node.js Express + RAG
│   ├── rag/                    # RAG Pipeline
│   │   ├── vectorStore.js      # In-memory vector DB
│   │   ├── chunker.js          # Document chunking
│   │   ├── embeddings.js       # OpenAI embeddings
│   │   ├── pdfIngestion.js     # PDF processing
│   │   └── index.js            # RAG orchestrator
│   ├── routes/                 # API endpoints
│   ├── utils/                  # Utilities (logger, safety)
│   ├── services/               # Business logic
│   └── index.js                # Express server
│
└── fastapi/                     # Python Medical Analysis
    ├── main.py                 # FastAPI app
    ├── schemas.py              # Pydantic models
    ├── logic.py                # Medical analysis logic
    └── requirements.txt
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ with npm
- **Python** 3.10+ with pip
- **OpenAI API Key** (from https://platform.openai.com/api-keys)

### 1. Backend Setup (Node.js)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk_your_key_here

# Start the server
npm run dev
# Server runs on http://localhost:5000
```

**API Endpoints:**
- `POST /api/rag/ingest` - Upload medical PDF
- `POST /api/rag/query` - Query knowledge base
- `GET /api/rag/stats` - Get pipeline stats
- `POST /api/medical/symptoms` - Analyze symptoms
- `GET /api/health` - Health check

### 2. FastAPI Setup (Python)

```bash
cd fastapi

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn main:app --reload --port 8000
# Server runs on http://localhost:8000
```

### 3. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# UI available at http://localhost:5173
```

## 📝 Usage Examples

### Example 1: Upload a Medical PDF

```bash
curl -X POST http://localhost:5000/api/rag/ingest \
  -F "file=@medical_handbook.pdf"
```

Response:
```json
{
  "success": true,
  "data": {
    "fileName": "medical_handbook.pdf",
    "numPages": 150,
    "chunksCreated": 342,
    "validationResult": {
      "isMedicalContent": true,
      "relevanceScore": 95
    }
  }
}
```

### Example 2: Query the Knowledge Base

```bash
curl -X POST http://localhost:5000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the symptoms of diabetes?"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "response": "Based on medical literature...",
    "sourcesUsed": [
      {
        "source": "medical_handbook.pdf",
        "similarity": 0.892,
        "excerpt": "..."
      }
    ],
    "confidence": 0.8
  }
}
```

### Example 3: Analyze Symptoms

```bash
curl -X POST http://localhost:8000/api/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough", "fatigue"],
    "age": 35,
    "gender": "M",
    "duration": "3 days"
  }'
```

Response:
```json
{
  "severity_score": 65,
  "risk_level": "MEDIUM",
  "is_emergency": false,
  "symptoms_analysis": {
    "fever": "Elevated body temperature may indicate infection",
    "cough": "Respiratory symptom"
  },
  "recommendations": [
    "Consult a healthcare provider",
    "Monitor symptoms",
    "Stay hydrated"
  ]
}
```

## 🔒 Safety Features

### Medical Disclaimer
Every response includes a mandatory disclaimer:
```
⚠️ IMPORTANT: This information is for educational purposes only 
and is NOT a substitute for professional medical advice.
Always consult with qualified healthcare providers.
```

### Emergency Detection
Automatic detection of emergency keywords:
- Chest pain
- Difficulty breathing
- Loss of consciousness
- Severe bleeding
- Poisoning/Overdose
- Stroke symptoms

### Diagnostic Guardrails
- Replaces diagnostic claims with educational language
- Prevents "you have X" statements
- Enforces professional consultation recommendations
- Validates response safety before returning

## 🛠️ Configuration

### Backend Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_key_here
OPENAI_ORG_ID=optional_org_id

# Server
PORT=5000
NODE_ENV=development

# RAG Configuration
CHUNK_SIZE=500
CHUNK_OVERLAP=100
SIMILARITY_THRESHOLD=0.7

# FastAPI Service
FASTAPI_URL=http://localhost:8000
```

### Tech Stack

**Backend (Node.js):**
- Express.js 4.18.2
- LangChain 0.1.36
- OpenAI SDK 4.62.1 (v4 only)
- dotenv 16.4.5
- pdf-parse 1.1.1

**Medical Logic (Python):**
- FastAPI 0.104.1
- Uvicorn 0.24.0
- Pydantic 2.5.0

**Frontend (React):**
- React 18.2.0
- Vite 5.0.8
- Tailwind CSS 3.3.6
- Axios 1.6.2

## 📚 RAG Pipeline Workflow

1. **PDF Ingestion**
   - Upload medical PDF
   - Extract text using pdf-parse
   - Validate medical content

2. **Chunking**
   - Split text into 500-char chunks
   - Implement 100-char overlap
   - Preserve context between chunks

3. **Embedding Generation**
   - Use OpenAI text-embedding-3-small
   - Generate 1536-dimensional vectors
   - Cache for fast retrieval

4. **Vector Storage**
   - Store in in-memory vector database
   - Index by similarity
   - Maintain metadata (source, page, etc.)

5. **Query Processing**
   - Generate query embedding
   - Retrieve top-5 similar chunks (threshold: 0.7)
   - Pass context to LLM

6. **Response Generation**
   - LLM generates response with context
   - Enforce safety constraints
   - Add citations and metadata

## 🧪 Testing

### Manual API Testing with Curl

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test FastAPI health
curl http://localhost:8000/health

# Test symptom analysis
curl -X POST http://localhost:8000/api/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{"symptoms": ["fever", "cough"]}'
```

## 📦 Deployment

### Docker Support (Optional)

```bash
# Build backend image
docker build -t medioracle-backend ./backend

# Run backend container
docker run -p 5000:5000 \
  -e OPENAI_API_KEY=your_key \
  medioracle-backend

# Build frontend image
docker build -t medioracle-frontend ./frontend

# Run frontend container
docker run -p 5173:5173 medioracle-frontend
```

## 🔐 Security Considerations

1. **API Key Management**
   - Never commit `.env` files
   - Use environment variables in production
   - Rotate API keys regularly

2. **Input Validation**
   - Validate all user inputs
   - Sanitize PDF uploads
   - Rate limit API endpoints

3. **Data Privacy**
   - Don't store sensitive patient data
   - Use HTTPS in production
   - Comply with HIPAA guidelines

4. **Error Handling**
   - Never expose internal errors to users
   - Log errors securely
   - Provide safe error messages

## 📖 API Documentation

### Interactive Docs
- Backend Swagger: http://localhost:5000
- FastAPI Swagger: http://localhost:8000/docs
- FastAPI ReDoc: http://localhost:8000/redoc

## 🚨 Important Disclaimers

**This application is designed for educational purposes only:**

- ❌ NOT a substitute for professional medical advice
- ❌ Cannot diagnose medical conditions
- ❌ Should NOT be used for emergency situations
- ✅ Always consult qualified healthcare providers
- ✅ Call 911 for medical emergencies

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add comprehensive documentation
4. Submit a pull request

## 📞 Support

For issues, questions, or suggestions:
- Open a GitHub issue
- Contact: support@medioracle.ai

---

**Remember: This is an educational tool. Always prioritize professional medical care and consult qualified healthcare providers for medical decisions.**

⚠️ **Medical Disclaimer**: This application provides general educational information about health topics. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Users of this application acknowledge that information is for educational purposes only and assume full responsibility for any decisions made based on this information.
