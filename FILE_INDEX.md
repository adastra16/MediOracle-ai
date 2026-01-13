# 📑 MediOracle AI - Complete File Index & Documentation Map

## 📚 Documentation Files (Start Here!)

| File | Purpose | Key Sections |
|------|---------|--------------|
| **QUICK_START.md** | 1-minute startup guide | Prerequisites, Quick Start, Testing |
| **README.md** | Main documentation | Features, Architecture, Tech Stack, Usage |
| **SETUP.md** | Detailed setup guide | Installation steps, Troubleshooting, Verification |
| **API_REFERENCE.md** | Complete API docs | All endpoints, Examples, Error codes |
| **ARCHITECTURE.md** | System design | Data flows, Component maps, Diagrams |
| **PROJECT_COMPLETION.md** | Project summary | Features, Tech, Configuration |

---

## 🎯 Start with These Steps

1. **Read**: QUICK_START.md (5 minutes)
2. **Setup**: Follow SETUP.md (10 minutes)
3. **Run**: Execute start-dev.bat or start-dev.sh
4. **Test**: Open http://localhost:5173
5. **Reference**: Use API_REFERENCE.md for endpoints

---

## 📁 Frontend Structure

### Configuration Files
```
frontend/package.json          # Dependencies, scripts
frontend/vite.config.js        # Vite bundler config
frontend/tailwind.config.js    # Tailwind CSS config
frontend/postcss.config.js     # PostCSS plugins
frontend/index.html            # HTML entry point
frontend/.env.example          # Environment template
```

### Source Code
```
frontend/src/main.jsx          # React entry point
frontend/src/App.jsx           # Main app component
frontend/src/index.css         # Global styles (Tailwind)

frontend/src/api/
  └─ client.js                 # Axios API client
     • ragAPI (ingest, query, stats, clear)
     • medicalAPI (analyze, symptoms)
     • healthAPI (health, info)

frontend/src/components/
  ├─ PDFUpload.jsx            # PDF file upload form
  │  • File validation
  │  • Upload progress
  │  • Success/error display
  │
  ├─ RAGQuery.jsx             # Medical Q&A form
  │  • Query input
  │  • Source citations
  │  • Confidence indicator
  │  • Medical disclaimer
  │
  └─ SymptomAnalyzer.jsx      # Symptom analysis form
     • Symptom input
     • Severity score
     • Risk classification
     • Emergency detection
     • Recommendations
```

---

## 🖥️ Backend (Node.js) Structure

### Configuration & Server
```
backend/package.json           # Dependencies (OpenAI v4.62.1, dotenv 16.4.5)
backend/index.js               # Express server setup
backend/.env.example           # Required environment variables
backend/.gitignore            # Git ignore file
```

### RAG Pipeline (`backend/rag/`)
```
backend/rag/index.js           # Main RAG Orchestrator
  • ingestPDF() - Complete PDF ingestion
  • retrieveRelevantDocuments() - Semantic search
  • generateResponse() - LLM response with safety
  • query() - End-to-end query pipeline

backend/rag/vectorStore.js     # In-Memory Vector Database
  • addDocument() - Add chunks with embeddings
  • search() - Cosine similarity search
  • cosineSimilarity() - Calculate similarity
  • getStats() - Return statistics
  • clear() - Reset database

backend/rag/chunker.js         # Document Chunking
  • chunkText() - Split into 500-char chunks with 100-char overlap
  • calculateOverlap() - Sliding window overlap
  • chunkDocuments() - Batch chunking

backend/rag/embeddings.js      # OpenAI Embeddings Service
  • initialize() - Setup embeddings client
  • generateEmbedding() - Single text embedding
  • generateEmbeddingsBatch() - Batch embeddings
  • getModelInfo() - Model configuration

backend/rag/pdfIngestion.js    # PDF Processing
  • extractTextFromPDF() - Text extraction
  • processPDFFile() - File processing
  • validateMedicalContent() - Content validation
  • cleanText() - Text preprocessing
```

### API Routes (`backend/routes/`)
```
backend/routes/ragRoutes.js    # RAG Endpoints
  • POST /rag/ingest - Upload PDF
  • POST /rag/query - Query knowledge base
  • GET /rag/stats - Get statistics
  • DELETE /rag/clear - Clear vector store

backend/routes/healthRoutes.js # Health & Info
  • GET /health - Health check
  • GET /info - API information

backend/routes/medicalRoutes.js # Medical Analysis
  • POST /medical/symptoms - Symptom analysis
  • POST /medical/analyze - Detailed analysis
```

### Utilities (`backend/utils/`)
```
backend/utils/logger.js        # Logging Utility
  • info() - Information logs
  • error() - Error logs
  • warn() - Warning logs
  • debug() - Debug logs

backend/utils/safety.js        # Medical Safety Guardrails
  • MEDICAL_DISCLAIMER - Disclaimer text
  • EMERGENCY_KEYWORDS - Emergency keyword list
  • detectEmergency() - Check emergency
  • generateEmergencyResponse() - Emergency response
  • addSafetyFooter() - Add disclaimer
  • validateMedicalResponse() - Validate safety
  • enforceConstraints() - Enforce constraints
```

### Services (`backend/services/`)
```
backend/services/testData.js   # Test Data
  • SAMPLE_MEDICAL_TEXTS - Sample medical content
  • SAMPLE_SYMPTOMS - Test symptoms
  • TEST_QUERIES - Test queries
  • generateSampleMedicalPDF() - Generate test data
```

---

## 🐍 FastAPI Backend (Python) Structure

### Configuration & Server
```
fastapi/main.py                # FastAPI Application
  • Root endpoint "/"
  • GET /health - Health check
  • POST /api/analyze-symptoms - Symptom analysis
  • POST /api/analyze - Detailed analysis
  • CORS middleware
  • Medical disclaimer headers
  • Exception handling

fastapi/schemas.py            # Pydantic Models
  • SymptomAnalysisRequest - Request validation
  • SymptomAnalysisResponse - Response model
  • DetailedAnalysisRequest - Request validation
  • DetailedAnalysisResponse - Response model
  • HealthCheckResponse - Health check model

fastapi/logic.py              # Medical Analysis Engine
  • MEDICAL_DISCLAIMER - Disclaimer text
  • EMERGENCY_SYMPTOMS - Emergency keywords
  • SYMPTOM_SEVERITY_MAP - Severity mapping
  • calculate_severity_score() - Score calculation
  • classify_risk_level() - Risk classification
  • detect_emergency() - Emergency detection
  • analyze_symptoms() - Main analysis
  • get_condition_suggestions() - Suggestions
  • generate_emergency_response() - Emergency response

fastapi/requirements.txt      # Python Dependencies
  • fastapi==0.104.1
  • uvicorn==0.24.0
  • pydantic==2.5.0
  • python-multipart==0.0.6
```

---

## 🚀 Startup Scripts

```
start-dev.bat                  # Windows startup script
  • Checks prerequisites
  • Starts backend (npm run dev)
  • Starts FastAPI (uvicorn)
  • Starts frontend (npm run dev)
  • Displays service URLs
  • Shows process information

start-dev.sh                   # macOS/Linux startup script
  • Same functionality as .bat
  • Uses bash syntax
  • Activates Python venv
  • Manages background processes
```

---

## 📋 Configuration Files

```
.env.example (backend)         # Backend environment template
  • OPENAI_API_KEY - Required
  • PORT - Server port
  • NODE_ENV - Environment
  • CHUNK_SIZE - PDF chunk size
  • CHUNK_OVERLAP - Chunk overlap
  • SIMILARITY_THRESHOLD - Search threshold
  • FASTAPI_URL - FastAPI location

.env.example (frontend)        # Frontend environment template
  • VITE_API_URL - Backend API URL

.gitignore                     # Git ignore patterns
  • node_modules/
  • dist/
  • __pycache__/
  • .env files
  • Virtual environments
```

---

## 📚 Key Dependencies

### Frontend (package.json)
```
react@18.2.0                   # UI framework
react-dom@18.2.0              # DOM rendering
axios@1.6.2                   # HTTP client
vite@5.0.8                    # Build tool
tailwindcss@3.3.6             # CSS framework
postcss@8.4.32                # CSS processing
autoprefixer@10.4.16          # CSS prefixer
```

### Backend (package.json)
```
express@4.18.2                # Web framework
cors@2.8.5                    # CORS middleware
dotenv@16.4.5                 # Environment config (EXACT VERSION)
openai@4.62.1                 # OpenAI SDK v4 (EXACT VERSION - NOT v6)
langchain@0.1.36              # LLM framework
@langchain/core@0.1.48        # LangChain core
@langchain/community@0.1.28   # Community integrations
pdf-parse@1.1.1               # PDF parsing
axios@1.6.2                   # HTTP client
multer@1.4.5-lts.1            # File upload
nodemon@3.0.2                 # Development watch
```

### FastAPI (requirements.txt)
```
fastapi==0.104.1              # Web framework
uvicorn==0.24.0               # ASGI server
pydantic==2.5.0               # Data validation
python-multipart==0.0.6       # Form data
```

---

## 🔗 API Endpoint Map

### Frontend → Backend Routes
```
POST /api/rag/ingest          → ragRoutes → RAGPipeline.ingestPDF()
POST /api/rag/query           → ragRoutes → RAGPipeline.query()
GET  /api/rag/stats           → ragRoutes → RAGPipeline.getStats()
DELETE /api/rag/clear         → ragRoutes → RAGPipeline.clear()

POST /api/medical/symptoms    → medicalRoutes → FastAPI proxy
POST /api/medical/analyze     → medicalRoutes → FastAPI proxy

GET  /api/health              → healthRoutes
GET  /api/info                → healthRoutes
```

### Backend → FastAPI Routes
```
POST http://localhost:8000/api/analyze-symptoms
POST http://localhost:8000/api/analyze
GET http://localhost:8000/health
```

---

## 🔑 Environment Variables

### Required (backend/.env)
```
OPENAI_API_KEY=sk_your_actual_key_here
```

### Optional (backend/.env)
```
PORT=5000
NODE_ENV=development
CHUNK_SIZE=500
CHUNK_OVERLAP=100
SIMILARITY_THRESHOLD=0.7
FASTAPI_URL=http://localhost:8000
OPENAI_ORG_ID=optional
```

### Frontend (frontend/.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📊 Data Models

### PDF/Document Model
```javascript
{
  id: number,
  content: string,
  embedding: Array<number>,    // 1536 dimensions
  metadata: {
    source: string,
    page: number,
    chunkIndex: number,
    timestamp: string,
    totalChunks: number
  }
}
```

### RAG Query Response
```javascript
{
  success: boolean,
  response: string,            // Main answer
  sourcesUsed: Array<{
    source: string,
    similarity: number,
    excerpt: string
  }>,
  confidence: number,           // 0.0-1.0
  tokensUsed: {
    input: number,
    output: number
  }
}
```

### Symptom Analysis Response
```javascript
{
  severity_score: number,       // 0-100
  risk_level: string,           // LOW/MEDIUM/HIGH/CRITICAL
  is_emergency: boolean,
  symptoms_analysis: Object,
  recommendations: Array<string>,
  disclaimer: string
}
```

---

## 🧪 Testing Entry Points

### Frontend Testing
- http://localhost:5173 - Main UI
- DevTools → Console for errors
- Network tab for API calls

### Backend Testing
- http://localhost:5000/api/health
- http://localhost:5000 - API documentation
- Terminal logs for debugging

### FastAPI Testing
- http://localhost:8000/docs - Swagger UI
- http://localhost:8000/redoc - ReDoc UI
- Terminal logs

---

## 📖 Documentation Organization

```
Root Level Documentation/
├── QUICK_START.md            ← Start here! (1 min read)
├── SETUP.md                  ← Setup & troubleshooting
├── README.md                 ← Main documentation
├── API_REFERENCE.md          ← All API endpoints
├── ARCHITECTURE.md           ← System design & flows
├── PROJECT_COMPLETION.md     ← Project summary
└── FILE_INDEX.md             ← This file

Code Comments/
├── backend/rag/index.js      ← RAG pipeline comments
├── backend/utils/safety.js   ← Safety layer comments
├── backend/routes/           ← Route handler comments
├── frontend/src/App.jsx      ← UI component comments
└── fastapi/logic.py          ← Medical logic comments
```

---

## 🚀 Command Reference

### Backend
```bash
cd backend
npm install                    # Install dependencies
npm run dev                   # Start development server
npm start                     # Start production server
npm test                      # Run tests
```

### FastAPI
```bash
cd fastapi
python -m venv venv           # Create virtual environment
source venv/bin/activate      # Activate (macOS/Linux)
venv\Scripts\activate         # Activate (Windows)
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                   # Start development server
npm run build                 # Build for production
npm run preview               # Preview build
```

---

## 🔍 File Search Quick Guide

### By Purpose
- **PDF Handling**: `backend/rag/pdfIngestion.js`
- **Embeddings**: `backend/rag/embeddings.js`
- **Vector Search**: `backend/rag/vectorStore.js`
- **Document Chunks**: `backend/rag/chunker.js`
- **LLM Integration**: `backend/rag/index.js`
- **Safety Features**: `backend/utils/safety.js`
- **Medical Logic**: `fastapi/logic.py`
- **UI Components**: `frontend/src/components/`

### By Technology
- **Express Routes**: `backend/routes/`
- **FastAPI**: `fastapi/main.py`
- **React Components**: `frontend/src/components/`
- **Axios Client**: `frontend/src/api/client.js`
- **Styling**: `frontend/src/index.css`

---

## ✅ Verification Checklist

Run these to verify everything works:

```bash
# Check Node.js
node --version         # Should be 18+

# Check Python
python --version       # Should be 3.10+

# Check npm
npm --version         # Should be 9+

# Check pip
pip --version         # Should be 23+

# Check OpenAI key
echo $OPENAI_API_KEY  # Should not be empty
```

---

## 📞 Quick Help

### If frontend won't start:
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### If backend won't connect to OpenAI:
```bash
# Check .env file
cat backend/.env      # Should have OPENAI_API_KEY

# Test with curl
curl http://localhost:5000/api/health
```

### If FastAPI won't start:
```bash
cd fastapi
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

---

## 🎯 Common Workflows

### Upload Medical Document
1. Start all services
2. Open http://localhost:5173
3. Click "Knowledge Base Q&A"
4. Click upload area
5. Select PDF file
6. Wait for success message

### Ask Medical Question
1. After uploading PDF
2. Scroll to "Ask Medical Questions"
3. Type your question
4. Press "Search Knowledge Base"
5. View answer with sources

### Analyze Symptoms
1. Click "Symptom Analyzer" tab
2. Enter symptoms (comma-separated)
3. (Optional) Add age, gender, duration
4. Click "Analyze Symptoms"
5. View results with severity score

---

## 📈 Project Statistics

- **Total Files Created**: 40+ source files
- **Lines of Code**: 3,000+
- **Documentation Pages**: 7
- **API Endpoints**: 10+
- **React Components**: 4
- **Python Functions**: 15+
- **Safety Features**: 7+

---

## 🎉 Final Notes

This is a **production-ready** project with:
- ✅ Complete RAG implementation
- ✅ Medical safety guardrails
- ✅ Comprehensive documentation
- ✅ Professional code structure
- ✅ Full error handling
- ✅ Beautiful UI
- ✅ Extensive comments

Everything is ready to use. Start with QUICK_START.md!

---

**Version**: 1.0.0  
**Status**: ✅ Complete  
**License**: MIT  
**Created**: January 2026
