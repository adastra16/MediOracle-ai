"""
MediOracle AI - FastAPI Medical Analysis Server
Provides symptom analysis, risk assessment, and medical guardrails
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from schemas import (
    SymptomAnalysisRequest,
    SymptomAnalysisResponse,
    DetailedAnalysisRequest,
    DetailedAnalysisResponse,
    HealthCheckResponse
)
from logic import (
    analyze_symptoms,
    get_condition_suggestions,
    generate_emergency_response,
    MEDICAL_DISCLAIMER,
    detect_emergency
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan context manager - properly defined
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("MediOracle AI FastAPI Server starting...")
    yield
    # Shutdown
    logger.info("MediOracle AI FastAPI Server shutting down...")

# Create FastAPI app
app = FastAPI(
    title="MediOracle AI - Medical Analysis API",
    description="FastAPI backend for medical symptom analysis and risk assessment",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Medical disclaimer header
@app.middleware("http")
async def add_medical_disclaimer_header(request, call_next):
    response = await call_next(request)
    response.headers["X-Medical-Disclaimer"] = "Educational information only. Not medical advice."
    return response


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint with service information"""
    return {
        "service": "MediOracle AI - Medical Analysis API",
        "version": "1.0.0",
        "status": "running",
        "disclaimer": MEDICAL_DISCLAIMER,
        "documentation": "/docs"
    }


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "MediOracle Medical Analysis",
        "version": "1.0.0"
    }


@app.post("/api/analyze-symptoms", response_model=SymptomAnalysisResponse, tags=["Medical Analysis"])
async def analyze_symptoms_endpoint(request: SymptomAnalysisRequest):
    """
    Analyze symptoms and return severity score and risk level
    
    **Warning**: This is educational information only. Always consult with a healthcare provider.
    """
    try:
        # Check for emergency
        if detect_emergency(request.symptoms):
            logger.warning(f"Emergency symptoms detected: {request.symptoms}")
            return generate_emergency_response()
        
        # Analyze symptoms
        result = analyze_symptoms(
            symptoms=request.symptoms,
            age=request.age,
            gender=request.gender
        )
        
        return SymptomAnalysisResponse(
            severity_score=result["severity_score"],
            risk_level=result["risk_level"],
            is_emergency=result["is_emergency"],
            symptoms_analysis=result["symptoms_analysis"],
            recommendations=result["recommendations"],
            disclaimer=result["disclaimer"]
        )
    
    except Exception as e:
        logger.error(f"Error analyzing symptoms: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze", response_model=DetailedAnalysisResponse, tags=["Medical Analysis"])
async def detailed_analysis_endpoint(request: DetailedAnalysisRequest):
    """
    Perform detailed medical analysis with medical history consideration
    
    **Warning**: This is educational information only. Not a substitute for professional medical advice.
    """
    try:
        # Split symptoms if provided as single string
        symptoms = [s.strip() for s in request.symptoms.split(",")] if isinstance(request.symptoms, str) else request.symptoms
        
        # Check for emergency
        if detect_emergency(symptoms):
            logger.warning(f"Emergency symptoms detected in detailed analysis")
            return generate_emergency_response()
        
        # Get analysis
        analysis = analyze_symptoms(symptoms=symptoms)
        
        # Get condition suggestions
        conditions = get_condition_suggestions(symptoms, request.medical_history)
        
        # Determine when to seek help
        when_to_seek_help = [
            "Symptoms worsen or don't improve",
            "New or unusual symptoms develop",
            "Difficulty breathing or chest pain",
            "Loss of consciousness",
            "Severe pain",
            "High fever (above 103°F / 39.4°C)"
        ]
        
        # Risk factors
        risk_factors = request.medical_history or []
        if request.current_medications:
            risk_factors.append(f"Currently taking: {', '.join(request.current_medications)}")
        
        return DetailedAnalysisResponse(
            symptom_assessment=f"Assessment based on reported symptoms: {', '.join(symptoms)}. Professional medical evaluation is essential for accurate diagnosis.",
            possible_conditions=conditions,
            severity_level=analysis["risk_level"],
            recommended_actions=analysis["recommendations"],
            risk_factors=risk_factors,
            when_to_seek_help=when_to_seek_help,
            disclaimer=MEDICAL_DISCLAIMER
        )
    
    except Exception as e:
        logger.error(f"Error in detailed analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Custom exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return {
        "success": False,
        "error": "Internal server error",
        "detail": str(exc)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
