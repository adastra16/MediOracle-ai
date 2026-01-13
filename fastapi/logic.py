"""
Medical Logic Engine - Rule-based medical analysis and severity scoring
"""

from typing import List, Dict, Literal
from dataclasses import dataclass

MEDICAL_DISCLAIMER = """
⚠️ IMPORTANT MEDICAL DISCLAIMER

This information is for educational purposes only and does NOT constitute medical advice.
It is not a substitute for professional medical diagnosis, treatment, or consultation.

🚨 SEEK IMMEDIATE EMERGENCY CARE FOR:
- Chest pain or pressure
- Difficulty breathing
- Loss of consciousness
- Severe bleeding or trauma
- Poisoning or overdose
- Signs of stroke
- Severe allergic reactions

Always consult a qualified healthcare provider for proper evaluation and treatment.
"""

# Emergency keywords that require immediate attention
EMERGENCY_SYMPTOMS = {
    "chest pain",
    "severe breathing difficulty",
    "loss of consciousness",
    "severe bleeding",
    "poisoning",
    "anaphylaxis",
    "stroke symptoms",
    "cardiac arrest",
    "severe trauma",
    "overdose",
    "uncontrolled seizure"
}

# Symptom to severity mapping
SYMPTOM_SEVERITY_MAP = {
    # Critical (90-100)
    "chest pain": 95,
    "difficulty breathing": 90,
    "loss of consciousness": 100,
    "severe bleeding": 95,
    
    # High (70-89)
    "severe headache": 75,
    "high fever": 80,
    "severe abdominal pain": 85,
    "paralysis": 90,
    
    # Medium (40-69)
    "moderate fever": 55,
    "cough": 45,
    "mild headache": 35,
    "diarrhea": 50,
    "fatigue": 40,
    "nausea": 45,
    
    # Low (0-39)
    "mild headache": 25,
    "runny nose": 15,
    "itching": 10,
    "mild rash": 30,
}

# Risk level classification
RISK_LEVELS = {
    "CRITICAL": (90, 100),
    "HIGH": (70, 89),
    "MEDIUM": (40, 69),
    "LOW": (0, 39)
}


def calculate_severity_score(symptoms: List[str]) -> int:
    """
    Calculate severity score based on symptoms
    
    Args:
        symptoms: List of symptom strings
        
    Returns:
        Severity score 0-100
    """
    if not symptoms:
        return 0
    
    scores = []
    for symptom in symptoms:
        symptom_lower = symptom.lower()
        
        # Find matching severity
        score = 20  # Default baseline
        
        for known_symptom, severity in SYMPTOM_SEVERITY_MAP.items():
            if known_symptom in symptom_lower:
                score = severity
                break
        
        scores.append(score)
    
    # Average with weight towards highest severity
    average = sum(scores) / len(scores)
    maximum = max(scores)
    
    # Weight: 60% average + 40% max (emphasize worst symptom)
    final_score = int(average * 0.6 + maximum * 0.4)
    return min(100, max(0, final_score))


def classify_risk_level(severity_score: int) -> Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
    """
    Classify risk level based on severity score
    
    Args:
        severity_score: Calculated severity score 0-100
        
    Returns:
        Risk level classification
    """
    for level, (min_score, max_score) in RISK_LEVELS.items():
        if min_score <= severity_score <= max_score:
            return level
    
    return "LOW"


def detect_emergency(symptoms: List[str]) -> bool:
    """
    Detect if symptoms indicate emergency situation
    
    Args:
        symptoms: List of symptoms
        
    Returns:
        True if emergency detected
    """
    symptoms_lower = [s.lower() for s in symptoms]
    
    for emergency_symptom in EMERGENCY_SYMPTOMS:
        if any(emergency_symptom in symptom for symptom in symptoms_lower):
            return True
    
    return False


def analyze_symptoms(
    symptoms: List[str],
    age: int = None,
    gender: str = None
) -> Dict:
    """
    Analyze symptoms and return detailed assessment
    
    Args:
        symptoms: List of symptoms
        age: Patient age (optional)
        gender: Patient gender (optional)
        
    Returns:
        Analysis result dictionary
    """
    severity_score = calculate_severity_score(symptoms)
    risk_level = classify_risk_level(severity_score)
    is_emergency = detect_emergency(symptoms)
    
    # Generate symptom analysis
    symptoms_analysis = {}
    for symptom in symptoms:
        symptom_lower = symptom.lower()
        
        if "fever" in symptom_lower:
            symptoms_analysis[symptom] = "Elevated body temperature may indicate infection, inflammation, or other medical condition"
        elif "cough" in symptom_lower:
            symptoms_analysis[symptom] = "Respiratory symptom that may indicate viral/bacterial infection or other respiratory condition"
        elif "headache" in symptom_lower:
            symptoms_analysis[symptom] = "Head pain that can have many causes including tension, migraines, or underlying conditions"
        elif "fatigue" in symptom_lower:
            symptoms_analysis[symptom] = "General weakness or exhaustion that may indicate infection, sleep issues, or other conditions"
        elif "pain" in symptom_lower:
            symptoms_analysis[symptom] = "Localized or general pain requiring proper medical evaluation"
        else:
            symptoms_analysis[symptom] = "Symptom requiring professional medical evaluation"
    
    # Generate recommendations
    recommendations = [
        "Consult a qualified healthcare provider for proper evaluation",
        "Keep track of symptom progression and duration",
        "Follow basic health precautions (hygiene, rest, hydration)"
    ]
    
    if risk_level in ["HIGH", "CRITICAL"]:
        recommendations.insert(0, "⚠️ Seek medical attention promptly")
    
    if is_emergency:
        recommendations.insert(0, "🚨 SEEK EMERGENCY CARE IMMEDIATELY (Call 911 or go to ER)")
    
    return {
        "severity_score": severity_score,
        "risk_level": risk_level,
        "is_emergency": is_emergency,
        "symptoms_analysis": symptoms_analysis,
        "recommendations": recommendations,
        "age": age,
        "gender": gender,
        "disclaimer": MEDICAL_DISCLAIMER
    }


def get_condition_suggestions(
    symptoms: List[str],
    medical_history: List[str] = None
) -> List[Dict]:
    """
    Generate possible condition suggestions (educational only)
    
    Args:
        symptoms: List of symptoms
        medical_history: Patient medical history
        
    Returns:
        List of possible conditions with educational information
    """
    suggestions = []
    
    symptoms_str = " ".join(s.lower() for s in symptoms)
    
    # Educational condition mapping (not diagnostic)
    condition_map = {
        "fever and cough": {
            "condition": "Possible respiratory infection (viral or bacterial)",
            "likelihood": "high",
            "info": "Common symptoms include fever, cough, fatigue"
        },
        "headache and fever": {
            "condition": "Possible viral illness or infection",
            "likelihood": "moderate",
            "info": "Often associated with flu or other infectious diseases"
        },
        "chest pain": {
            "condition": "Multiple possible causes - requires emergency evaluation",
            "likelihood": "unknown",
            "info": "Can indicate heart problems or other serious conditions"
        },
        "severe headache": {
            "condition": "Possible tension headache, migraine, or serious condition",
            "likelihood": "moderate",
            "info": "Requires professional evaluation to determine cause"
        }
    }
    
    for key, condition in condition_map.items():
        if key in symptoms_str:
            suggestions.append(condition)
    
    # Default suggestion if no specific match
    if not suggestions:
        suggestions.append({
            "condition": "Requires professional medical evaluation",
            "likelihood": "unknown",
            "info": "Consult a healthcare provider for proper diagnosis"
        })
    
    return suggestions


def generate_emergency_response() -> Dict:
    """Generate emergency response"""
    return {
        "is_emergency": True,
        "severity_score": 100,
        "risk_level": "CRITICAL",
        "message": "🚨 EMERGENCY DETECTED 🚨\n\nYour symptoms may indicate a medical emergency.\n\n📞 CALL 911 IMMEDIATELY or go to the nearest emergency room.\n\nDO NOT DELAY. Seek immediate professional medical care.",
        "disclaimer": MEDICAL_DISCLAIMER
    }
