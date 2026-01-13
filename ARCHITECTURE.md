# MediOracle AI - System Architecture & Data Flow

## Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE LAYER                             │
│                    React (Vite) - Port 5173                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │  PDF Upload      │  │  RAG Query       │  │ Symptom Analyzer │     │
│  │  Component       │  │  Component       │  │   Component      │     │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘     │
│           │                     │                     │                │
│           └─────────────────────┴─────────────────────┘                │
│                          ↓                                              │
│              Axios API Client (src/api/client.js)                       │
│                                                                          │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ HTTP/JSON
                           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & MIDDLEWARE LAYER                        │
│                    Express - Port 5000                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  CORS Enabled | Medical Disclaimer Headers | Error Handling              │
└──────────────┬──────────────────────────────┬─────────────────────────┘
               │ /api/rag/*                   │ /api/medical/*
               ↓                              ↓
    ┌──────────────────────────┐   ┌──────────────────────────┐
    │  RAG PIPELINE ROUTES     │   │ MEDICAL ROUTES           │
    │ (ragRoutes.js)           │   │ (medicalRoutes.js)       │
    │                          │   │                          │
    │ • POST /rag/ingest       │   │ • POST /medical/symptoms │
    │ • POST /rag/query        │   │ • POST /medical/analyze  │
    │ • GET  /rag/stats        │   │                          │
    │ • DELETE /rag/clear      │   │                          │
    └────────┬─────────────────┘   └────────┬─────────────────┘
             │                             │
             ↓                             ↓
    ┌─────────────────────────────────────────┐
    │    CORE PROCESSING LAYERS               │
    └──────────┬──────────────────────┬───────┘
               │                      │
    ┌──────────┴──────────┐    ┌──────┴──────────┐
    │  RAG PIPELINE       │    │  MEDICAL LOGIC  │
    │  (backend/rag/)     │    │  (fastapi/)     │
    └──────────┬──────────┘    └──────┬──────────┘
               │                      │
    ┌──────────┴──────────────────────┴──────┐
    │                                        │
    │  1. PDF INGESTION                      │
    │     └─ pdfIngestion.js                 │
    │        • Extract text from PDF         │
    │        • Validate medical content      │
    │        • Clean and preprocess          │
    │                                        │
    │  2. DOCUMENT CHUNKING                  │
    │     └─ chunker.js                      │
    │        • Split into 500-char chunks    │
    │        • Implement 100-char overlap    │
    │        • Preserve context              │
    │                                        │
    │  3. EMBEDDING GENERATION               │
    │     └─ embeddings.js                   │
    │        • Use OpenAI text-embedding-3   │
    │        • Generate 1536-dim vectors     │
    │        • Cache for reuse               │
    │                                        │
    │  4. VECTOR STORAGE                     │
    │     └─ vectorStore.js                  │
    │        • In-memory vector database     │
    │        • Cosine similarity search      │
    │        • Fast retrieval (<100ms)       │
    │                                        │
    │  5. RETRIEVAL & RANKING                │
    │     └─ index.js (RAG Orchestrator)     │
    │        • Semantic similarity matching  │
    │        • Top-5 chunks (0.7 threshold)  │
    │        • Citation tracking             │
    │                                        │
    │  6. LLM RESPONSE GENERATION            │
    │     └─ OpenAI GPT-4 API                │
    │        • Context-aware generation      │
    │        • Safety constraints enforced   │
    │        • Medical disclaimers added     │
    │                                        │
    │  7. MEDICAL ANALYSIS (FastAPI)         │
    │     └─ logic.py                        │
    │        • Symptom severity scoring      │
    │        • Risk classification           │
    │        • Emergency detection           │
    │        • Rule-based analysis           │
    │                                        │
    └────────────────────────────────────────┘
             │                           │
             ↓                           ↓
    ┌──────────────────────┐   ┌──────────────────┐
    │  EXTERNAL SERVICES   │   │  SAFETY LAYER    │
    ├──────────────────────┤   ├──────────────────┤
    │  OpenAI LLM (v4)     │   │ Medical Safety   │
    │  • text-embedding-3  │   │ • Disclaimers    │
    │  • gpt-4             │   │ • Emergency      │
    │  • gpt-4-turbo       │   │   detection      │
    │                      │   │ • Claim          │
    │  Pinecone (Optional) │   │   prevention     │
    │  • Persistent store  │   │ • Response       │
    │  • Scaling           │   │   validation     │
    └──────────────────────┘   └──────────────────┘
             ↑                           ↑
             └─────────────┬─────────────┘
                          │
                   Response Building
                   • Metadata collection
                   • Citation formatting
                   • Confidence scoring
                   • Disclaimer inclusion
                          │
                          ↓
         ┌────────────────────────────────┐
         │    API RESPONSE (JSON)          │
         ├────────────────────────────────┤
         │ • response (main text)          │
         │ • sourcesUsed (citations)       │
         │ • confidence (0.0-1.0)          │
         │ • severity_score (0-100)        │
         │ • risk_level (LOW/MED/HIGH)    │
         │ • is_emergency (true/false)     │
         │ • recommendations (array)       │
         │ • disclaimer (safety text)      │
         └────────────────────────────────┘
                          │
                    HTTP Response
                          │
                          ↓
         ┌────────────────────────────────┐
         │  FRONTEND RENDERING             │
         │  • Display response             │
         │  • Show sources                 │
         │  • Display confidence           │
         │  • Highlight emergency (if any) │
         │  • Include disclaimers          │
         │  • Show recommendations         │
         └────────────────────────────────┘
                          │
                          ↓
                    USER SEES RESULT
```

---

## Data Flow: PDF Ingestion

```
User Uploads PDF
    ↓
[PDFUpload Component]
    ↓
POST /api/rag/ingest (multipart/form-data)
    ↓
[Express Middleware - Multer]
    ↓
pdfIngestion.processPDFFile()
    ├─ Extract text using pdf-parse
    ├─ Validate medical content
    └─ Clean and preprocess text
    ↓
chunker.chunkText()
    ├─ Split into 500-char chunks
    ├─ Implement 100-char overlap
    └─ Preserve metadata (source, index)
    ↓
embeddings.generateEmbeddingsBatch()
    ├─ Call OpenAI API for each chunk
    ├─ Generate 1536-dimensional vectors
    └─ Cache embeddings
    ↓
vectorStore.addDocument() [Multiple]
    ├─ Store chunk + embedding + metadata
    ├─ Index for similarity search
    └─ Track statistics
    ↓
Return Success Response
    ├─ fileName, numPages, chunksCreated
    ├─ Validation results
    └─ Vector store statistics
    ↓
Frontend: Display upload success
```

---

## Data Flow: RAG Query

```
User Enters Query
    ↓
[RAGQuery Component]
    ↓
POST /api/rag/query { query: "..." }
    ↓
RAGPipeline.query()
    ├─ Check for emergency keywords
    │  └─ If YES: Return emergency response
    ↓ (NO)
embeddings.generateEmbedding()
    ├─ Convert query to vector
    └─ 1536-dimensional representation
    ↓
vectorStore.search()
    ├─ Cosine similarity calculation
    ├─ Filter by threshold (0.7)
    ├─ Sort by similarity
    └─ Return top-5 chunks
    ↓
RAGPipeline.generateResponse()
    ├─ Construct system prompt
    │  └─ Medical education instructions
    │  └─ Safety constraints
    │  └─ Citation requirements
    ├─ Build context from chunks
    ├─ Call OpenAI GPT-4 API
    │  └─ Streaming response generation
    └─ Apply safety constraints
    ↓
enforceConstraints()
    ├─ Remove diagnostic claims
    ├─ Add professional consultation note
    └─ Ensure medical safety
    ↓
Build Response Object
    ├─ response (main text)
    ├─ sourcesUsed (citations with similarity)
    ├─ confidence (based on results)
    ├─ tokensUsed (tracking)
    └─ disclaimer (medical safety)
    ↓
Return Response to Frontend
    ↓
Frontend: Display answer with sources
```

---

## Data Flow: Symptom Analysis

```
User Enters Symptoms
    ↓
[SymptomAnalyzer Component]
    ├─ symptoms (array)
    ├─ age (optional)
    ├─ gender (optional)
    └─ duration (optional)
    ↓
POST /api/medical/symptoms
    ↓
Backend: axios → http://localhost:8000
    ↓
FastAPI: /api/analyze-symptoms
    ↓
detectEmergency(symptoms)
    ├─ Check for emergency keywords
    ├─ If found: Return emergency response
    └─ CALL 911 message
    ↓ (NO emergency)
calculate_severity_score()
    ├─ Map each symptom to score
    ├─ Weight average + maximum
    └─ Return 0-100 score
    ↓
classify_risk_level()
    ├─ Score 90-100 → CRITICAL
    ├─ Score 70-89  → HIGH
    ├─ Score 40-69  → MEDIUM
    └─ Score 0-39   → LOW
    ↓
analyze_symptoms()
    ├─ Generate symptom-by-symptom analysis
    ├─ Provide medical context for each
    ├─ Generate recommendations
    │  ├─ Basic health precautions
    │  ├─ When to seek help
    │  └─ Professional consultation note
    └─ Include medical disclaimer
    ↓
Return SymptomAnalysisResponse
    ├─ severity_score (0-100)
    ├─ risk_level (string)
    ├─ is_emergency (boolean)
    ├─ symptoms_analysis (dict)
    ├─ recommendations (array)
    └─ disclaimer (text)
    ↓
Backend: Forward to frontend
    ↓
Frontend: Display results
    ├─ Show severity score prominently
    ├─ Color-code risk level
    ├─ Display analysis per symptom
    ├─ List recommendations
    └─ Highlight disclaimer
    ↓
User sees comprehensive assessment
```

---

## Component Interaction Map

```
FRONTEND
├─ App.jsx (Main container)
│  ├─ State: activeTab, serverStatus, apiInfo
│  ├─ Effects: Check health on mount
│  └─ Children:
│     ├─ PDFUpload.jsx
│     │  ├─ Uses: ragAPI.ingestPDF()
│     │  └─ Displays: Upload progress, results
│     ├─ RAGQuery.jsx
│     │  ├─ Uses: ragAPI.query()
│     │  └─ Displays: Query results with sources
│     └─ SymptomAnalyzer.jsx
│        ├─ Uses: medicalAPI.analyzeSymptoms()
│        └─ Displays: Severity, risk, recommendations

BACKEND (Node.js)
├─ index.js (Express server)
│  ├─ Middleware: CORS, JSON parsing, logging
│  └─ Routes:
│     ├─ healthRoutes.js
│     │  ├─ GET /health → health status
│     │  └─ GET /info → API info + disclaimer
│     ├─ ragRoutes.js
│     │  ├─ POST /rag/ingest → PDFIngestionService
│     │  ├─ POST /rag/query → RAGPipeline.query()
│     │  ├─ GET /rag/stats → Pipeline stats
│     │  └─ DELETE /rag/clear → Clear vector store
│     └─ medicalRoutes.js
│        ├─ POST /medical/symptoms → Proxy to FastAPI
│        └─ POST /medical/analyze → Proxy to FastAPI

RAG ENGINE (Node.js)
├─ rag/index.js (Orchestrator)
│  ├─ ingestPDF() → Uses all RAG components
│  ├─ retrieveRelevantDocuments() → Uses vectorStore
│  ├─ generateResponse() → Uses OpenAI LLM
│  └─ query() → Complete pipeline
├─ rag/vectorStore.js (In-memory DB)
│  └─ search() → Cosine similarity
├─ rag/chunker.js (Document processing)
│  └─ chunkText() → 500-char chunks
├─ rag/embeddings.js (OpenAI)
│  └─ generateEmbeddingsBatch() → 1536-dim vectors
└─ rag/pdfIngestion.js (PDF handling)
   └─ processPDFFile() → Extract + validate

SAFETY LAYER (Node.js)
└─ utils/safety.js
   ├─ detectEmergency() → Emergency detection
   ├─ enforceConstraints() → Remove dangerous claims
   └─ addSafetyFooter() → Disclaimer injection

MEDICAL ENGINE (Python/FastAPI)
├─ main.py (FastAPI app)
│  ├─ POST /api/analyze-symptoms
│  └─ POST /api/analyze
├─ schemas.py (Pydantic models)
│  ├─ SymptomAnalysisRequest
│  ├─ SymptomAnalysisResponse
│  └─ DetailedAnalysisResponse
└─ logic.py (Medical logic)
   ├─ analyze_symptoms() → Scoring
   ├─ classify_risk_level() → Classification
   ├─ detect_emergency() → Emergency check
   └─ get_condition_suggestions() → Recommendations

EXTERNAL SERVICES
├─ OpenAI API (v4)
│  ├─ text-embedding-3-small (1536-dim)
│  └─ gpt-4 (response generation)
└─ Environment Variables
   ├─ OPENAI_API_KEY
   ├─ OPENAI_ORG_ID (optional)
   └─ Service URLs
```

---

## Request/Response Cycle

```
1. UPLOAD PDF CYCLE
━━━━━━━━━━━━━━━━━━━━━━
Frontend                Backend                  FastAPI              OpenAI
   │                      │                        │                    │
   │─ Select PDF ────────→│                        │                    │
   │                      │                        │                    │
   │                      │─ Extract text ─────────│                    │
   │                      │                        │                    │
   │                      │─ Generate embeddings ──────────────────────→│
   │                      │                        │←──── vectors ──────│
   │                      │                        │                    │
   │                      │─ Store in VectorDB    │                    │
   │                      │                        │                    │
   │←── Success + stats ──│                        │                    │
   │                      │                        │                    │


2. QUERY CYCLE
━━━━━━━━━━━━━━━━━━━━━━
Frontend                Backend                  OpenAI
   │                      │                        │
   │─ Ask question ──────→│                        │
   │                      │                        │
   │                      │─ Generate embedding ──→│
   │                      │←─────── vector ────────│
   │                      │                        │
   │                      │─ Search VectorDB      │
   │                      │  (top-5 chunks)       │
   │                      │                        │
   │                      │─ Generate response ───→│
   │                      │←─── answer + usage ────│
   │                      │                        │
   │                      │─ Add safety rules     │
   │                      │                        │
   │←─ Response + sources─│                        │
   │                      │                        │


3. SYMPTOM ANALYSIS CYCLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend                Backend              FastAPI
   │                      │                    │
   │─ Enter symptoms ────→│                    │
   │                      │─ Proxy to FastAPI ─→│
   │                      │                    │
   │                      │                    │─ Check emergency
   │                      │                    │─ Calculate severity
   │                      │                    │─ Classify risk
   │                      │                    │─ Generate analysis
   │                      │                    │
   │                      │←── Analysis ───────│
   │                      │                    │
   │←─ Display results ───│                    │
   │                      │                    │
```

---

## Deployment Architecture (Future)

```
┌────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  CDN / Load Balancer                    │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                      │
│     ┌───────────────────┼───────────────────┐                 │
│     │                   │                   │                 │
│  ┌──▼──┐            ┌──▼──┐            ┌──▼──┐              │
│  │React│            │React│            │React│              │
│  │Build│            │Build│            │Build│              │
│  │ v1  │            │ v2  │            │ v3  │              │
│  └─────┘            └─────┘            └─────┘              │
│                                                               │
│                  ↓  ↓  ↓  ↓  ↓                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Kubernetes Cluster / Docker Swarm           │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  Backend Pods x3           FastAPI Pods x2          │  │
│  │  ┌──────────────┐          ┌──────────────┐        │  │
│  │  │ Node.js Pod  │          │ FastAPI Pod  │        │  │
│  │  │ Express +    │          │ Medical      │        │  │
│  │  │ RAG Engines  │          │ Analysis     │        │  │
│  │  └──────────────┘          └──────────────┘        │  │
│  │  ┌──────────────┐          ┌──────────────┐        │  │
│  │  │ Node.js Pod  │          │ FastAPI Pod  │        │  │
│  │  │ Express +    │          │ Medical      │        │  │
│  │  │ RAG Engines  │          │ Analysis     │        │  │
│  │  └──────────────┘          └──────────────┘        │  │
│  │  ┌──────────────┐                                  │  │
│  │  │ Node.js Pod  │          Shared Services:        │  │
│  │  │ Express +    │          ┌──────────────┐       │  │
│  │  │ RAG Engines  │          │Redis Cache   │       │  │
│  │  └──────────────┘          │(Embeddings)  │       │  │
│  │                            └──────────────┘       │  │
│  │                            ┌──────────────┐       │  │
│  │                            │PostgreSQL    │       │  │
│  │                            │(Knowledge    │       │  │
│  │                            │Base)         │       │  │
│  │                            └──────────────┘       │  │
│  │                            ┌──────────────┐       │  │
│  │                            │Pinecone      │       │  │
│  │                            │(Vector Store)│       │  │
│  │                            └──────────────┘       │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                          ↓                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │        External Services (OpenAI, etc.)          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

**This comprehensive architecture ensures:**
- ✅ Scalability
- ✅ Reliability
- ✅ Medical safety
- ✅ High performance
- ✅ Easy maintenance
