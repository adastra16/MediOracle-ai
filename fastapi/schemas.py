"""
Medical Analysis Schemas - Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal

class SymptomAnalysisRequest(BaseModel):
    """Request schema for symptom analysis"""
    symptoms: List[str] = Field(..., description="List of symptoms")
    age: Optional[int] = Field(None, description="Patient age")
    gender: Optional[str] = Field(None, description="Patient gender")
    duration: Optional[str] = Field(None, description="Duration of symptoms")

    class Config:
        example = {
            "symptoms": ["fever", "cough", "fatigue"],
            "age": 35,
            "gender": "M",
            "duration": "3 days"
        }


class SymptomAnalysisResponse(BaseModel):
    """Response schema for symptom analysis"""
    severity_score: int = Field(..., description="Severity score 0-100")
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = Field(..., description="Risk classification")
    is_emergency: bool = Field(..., description="Whether emergency medical attention is needed")
    symptoms_analysis: Dict[str, str] = Field(..., description="Analysis of each symptom")
    recommendations: List[str] = Field(..., description="Medical recommendations")
    disclaimer: str = Field(..., description="Medical disclaimer")

    class Config:
        example = {
            "severity_score": 65,
            "risk_level": "MEDIUM",
            "is_emergency": False,
            "symptoms_analysis": {
                "fever": "Elevated body temperature may indicate infection",
                "cough": "Respiratory symptom",
                "fatigue": "General weakness"
            },
            "recommendations": [
                "Consult a healthcare provider",
                "Monitor symptoms",
                "Stay hydrated"
            ],
            "disclaimer": "This is educational information only. Seek professional medical advice."
        }


class DetailedAnalysisRequest(BaseModel):
    """Request schema for detailed medical analysis"""
    symptoms: str = Field(..., description="Description of symptoms")
    medical_history: List[str] = Field(default=[], description="Relevant medical history")
    current_medications: List[str] = Field(default=[], description="Current medications")

    class Config:
        example = {
            "symptoms": "persistent headache and dizziness",
            "medical_history": ["hypertension"],
            "current_medications": ["lisinopril"]
        }


class DetailedAnalysisResponse(BaseModel):
    """Response schema for detailed analysis"""
    symptom_assessment: str
    possible_conditions: List[Dict[str, str]]
    severity_level: str
    recommended_actions: List[str]
    risk_factors: List[str]
    when_to_seek_help: List[str]
    disclaimer: str

    class Config:
        example = {
            "symptom_assessment": "Combination of headache and dizziness warrants evaluation",
            "possible_conditions": [
                {"condition": "Tension headache", "likelihood": "moderate"},
                {"condition": "Hypertensive crisis", "likelihood": "low"}
            ],
            "severity_level": "MEDIUM",
            "recommended_actions": [
                "Monitor blood pressure",
                "Stay hydrated",
                "Rest in quiet environment"
            ],
            "risk_factors": ["Existing hypertension"],
            "when_to_seek_help": [
                "Sudden severe pain",
                "Vision changes",
                "Loss of consciousness"
            ],
            "disclaimer": "This information is for educational purposes only."
        }


class HealthCheckResponse(BaseModel):
    """Response schema for health check"""
    status: str
    service: str
    version: str
