# MediOracle AI - Setup Guide

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Node.js 18+ (check with `node --version`)
- ✅ npm 9+ (check with `npm --version`)
- ✅ Python 3.10+ (check with `python --version`)
- ✅ pip 23+ (check with `pip --version`)
- ✅ OpenAI API Key (get from https://platform.openai.com/api-keys)
- ✅ 2GB free disk space
- ✅ Internet connection

## 🚀 Installation Steps

### Step 1: Clone or Extract Project

```bash
cd MediOracle\ Ai
```

### Step 2: Set Up Backend (Node.js)

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your OpenAI API key
# Open .env in your editor and replace:
# OPENAI_API_KEY=your_actual_api_key_here
```

**Example .env file:**
```env
OPENAI_API_KEY=sk_test_xxxxxxxxxxxxx
PORT=5000
NODE_ENV=development
CHUNK_SIZE=500
CHUNK_OVERLAP=100
SIMILARITY_THRESHOLD=0.7
FASTAPI_URL=http://localhost:8000
```

### Step 3: Set Up FastAPI (Python)

```bash
cd ../fastapi

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Set Up Frontend (React)

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

## ▶️ Running the Application

### Option A: Automated Startup (Recommended)

**On Windows:**
```bash
cd MediOracle\ Ai
start-dev.bat
```

**On macOS/Linux:**
```bash
cd MediOracle\ Ai
chmod +x start-dev.sh
./start-dev.sh
```

### Option B: Manual Startup (3 Terminal Windows)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - FastAPI:**
```bash
cd fastapi
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

## 🌐 Access the Application

Once all services are running:

1. **Open Browser**: http://localhost:5173
2. **Backend API**: http://localhost:5000
3. **FastAPI Docs**: http://localhost:8000/docs
4. **FastAPI ReDoc**: http://localhost:8000/redoc

## 📝 First Steps

### 1. Verify Services are Running

Check API health:
```bash
curl http://localhost:5000/api/health
curl http://localhost:8000/health
```

You should see JSON responses with status "ok".

### 2. Upload a Medical PDF

Use the UI or:
```bash
curl -X POST http://localhost:5000/api/rag/ingest \
  -F "file=@sample_medical.pdf"
```

### 3. Query the Knowledge Base

```bash
curl -X POST http://localhost:5000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are common symptoms of diabetes?"}'
```

### 4. Test Symptom Analyzer

```bash
curl -X POST http://localhost:8000/api/analyze-symptoms \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough"],
    "age": 35,
    "gender": "M",
    "duration": "2 days"
  }'
```

## 🐛 Troubleshooting

### Issue: "Cannot find module 'openai'"

**Solution:**
```bash
cd backend
npm install openai@4.62.1
```

### Issue: "OPENAI_API_KEY is not defined"

**Solution:**
1. Check `.env` file exists in `backend/`
2. Ensure `OPENAI_API_KEY=sk_...` is set
3. Restart Node.js server

### Issue: Python virtual environment not activating

**Windows:**
```bash
cd fastapi
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**macOS/Linux:**
```bash
cd fastapi
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Port already in use

**Change port in .env:**
```env
PORT=5001  # Instead of 5000
```

Or kill process using the port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue: CORS errors in browser

**Solution:** Ensure all three services are running and using correct URLs in browser console.

### Issue: "ModuleNotFoundError: No module named 'fastapi'"

**Solution:**
```bash
cd fastapi
source venv/bin/activate  # macOS/Linux
# or venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   REACT FRONTEND                     │
│              (http://localhost:5173)                 │
│  ┌──────────────┬──────────────┐                    │
│  │  PDF Upload  │  RAG Query   │  Symptom Analyzer │
│  └──────────────┴──────────────┴──────────────────┘
└─────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────────┐
        │   CORS + Request Routing           │
        └────────────────────────────────────┘
                ↓                 ↓
┌──────────────────────┐  ┌──────────────────────┐
│  NODE.JS BACKEND     │  │   FASTAPI SERVER     │
│  (localhost:5000)    │  │   (localhost:8000)   │
│                      │  │                      │
│ ┌────────────────┐   │  │ ┌─────────────────┐  │
│ │ RAG Pipeline:  │   │  │ │ Medical Logic:  │  │
│ │ ┌────────────┐ │   │  │ │ ┌─────────────┐ │  │
│ │ │PDF Parsing │ │   │  │ │ │Symptom      │ │  │
│ │ ├────────────┤ │   │  │ │ │Severity     │ │  │
│ │ │Chunking    │ │   │  │ │ ├─────────────┤ │  │
│ │ ├────────────┤ │   │  │ │ │Risk Level   │ │  │
│ │ │Embeddings  │ │   │  │ │ ├─────────────┤ │  │
│ │ ├────────────┤ │   │  │ │ │Emergency    │ │  │
│ │ │Vector      │ │   │  │ │ │Detection    │ │  │
│ │ │Store       │ │   │  │ │ └─────────────┘ │  │
│ │ ├────────────┤ │   │  │ │ ┌─────────────┐ │  │
│ │ │Retrieval   │ │   │  │ │ │Safety       │ │  │
│ │ └────────────┘ │   │  │ │ │Guardrails   │ │  │
│ └────────────────┘   │  │ │ └─────────────┘ │  │
│                      │  │ └─────────────────┘  │
│  OpenAI LLM (v4)     │  │ Pydantic Models     │
└──────────────────────┘  └──────────────────────┘
```

## 🔐 Security Reminders

1. **Never commit `.env` files** - Add to .gitignore
2. **Rotate API keys regularly** - Don't share credentials
3. **Use HTTPS in production** - Not just HTTP
4. **Validate all inputs** - Especially file uploads
5. **Log errors securely** - Don't expose stack traces

## 📚 Documentation Files

- `README.md` - Main documentation
- `SETUP.md` - This file
- `backend/package.json` - Backend dependencies
- `fastapi/requirements.txt` - Python dependencies
- `frontend/package.json` - Frontend dependencies

## 🆘 Getting Help

1. Check error messages carefully
2. Review troubleshooting section
3. Check service URLs are correct
4. Ensure all dependencies installed
5. Review logs in terminal windows
6. Check OpenAI API key is valid

## ✅ Verification Checklist

- [ ] Node.js installed (v18+)
- [ ] Python installed (v3.10+)
- [ ] OpenAI API key obtained
- [ ] `.env` file created with API key
- [ ] Backend dependencies installed (`npm install`)
- [ ] FastAPI dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] All three services start without errors
- [ ] Browser can access http://localhost:5173
- [ ] API endpoints respond to health checks

## 🎯 Next Steps

1. Upload a sample medical PDF
2. Test RAG query functionality
3. Analyze sample symptoms
4. Review safety disclaimers
5. Explore API documentation

---

**⚠️ Important:** This is an educational tool. Always consult qualified healthcare professionals for medical decisions and emergencies. Call 911 immediately for medical emergencies.
