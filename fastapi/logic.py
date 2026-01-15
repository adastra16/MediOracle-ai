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
    "vomiting blood",
    "nose bleed",
    "epistaxis",
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
    "vomiting blood": 95,
    "nose bleed": 95,
    "epistaxis": 95,
    
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
    
    # Convert all symptoms to lowercase for consistent matching
    symptoms_lower = [s.lower() for s in symptoms]
    
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

    # Boosters for danger signs
    # If any bleeding or vomiting blood is present, escalate to critical
    if any(('bleed' in s or 'blood' in s or 'vomit' in s) for s in symptoms_lower):
        final_score = max(final_score, 95)

    # If there are two or more high-severity items, escalate
    high_count = sum(1 for sc in scores if sc >= 80)
    if high_count >= 2:
        final_score = max(final_score, 90)

    # Continuous or ongoing duration increases severity
    if any('continuous' in s or 'ongoing' in s or 'persistent' in s for s in symptoms_lower):
        final_score = min(100, final_score + 10)

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

    # Direct match against known emergency phrases
    for emergency_symptom in EMERGENCY_SYMPTOMS:
        if any(emergency_symptom in symptom for symptom in symptoms_lower):
            return True

    # Fuzzy checks for common danger combinations (e.g., 'vomit' + 'blood')
    for s in symptoms_lower:
        # Vomiting blood
        if 'vomit' in s and 'blood' in s:
            return True
        if 'throw' in s and 'blood' in s:
            return True
        if 'severe' in s and ('bleed' in s or 'bleeding' in s):
            return True
        # Nosebleed / epistaxis
        if ('nose' in s and 'bleed' in s) or 'epistaxis' in s or 'nosebleed' in s:
            return True
        # Continuous or ongoing bleeding considered urgent
        if ('continuous' in s or 'ongoing' in s) and ('bleed' in s or 'bleeding' in s):
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
    
    symptoms_lower = [s.lower() for s in symptoms]
    symptoms_str = " ".join(symptoms_lower)

    # Helper to add suggestion without duplicates
    def add_suggestion(condition, likelihood, info):
        cond = {"condition": condition, "likelihood": likelihood, "info": info}
        if not any(c["condition"] == condition for c in suggestions):
            suggestions.append(cond)

    # Emergency-related suggestions
    if any("vomit" in s and "blood" in s for s in symptoms_lower) or "vomiting blood" in symptoms_str:
        add_suggestion(
            "Possible upper gastrointestinal bleeding (e.g., peptic ulcer, varices)",
            "high",
            "Hematemesis (vomiting blood) can indicate bleeding in the upper GI tract and requires urgent medical evaluation. Seek emergency care."
        )

    # Fever + severe systemic signs
    if "high fever" in symptoms_str or any("fever" in s for s in symptoms_lower):
        if "severe stomach pain" in symptoms_str or any("stomach" in s or "abdominal" in s for s in symptoms_lower):
            add_suggestion(
                "Possible dengue or severe systemic infection",
                "moderate",
                "High fever with severe abdominal pain can be seen in dengue and other systemic infections; evaluation and laboratory testing are often required."
            )
            add_suggestion(
                "Possible gastroenteritis or foodborne illness",
                "moderate",
                "Often includes fever, vomiting, and abdominal pain; usually self-limited but may require rehydration and assessment."
            )
        else:
            add_suggestion(
                "Possible viral infection (e.g., influenza)",
                "moderate",
                "Fever with respiratory or constitutional symptoms commonly indicates a viral infection."
            )

    # Vomiting and abdominal pain without notable fever
    if any("vomit" in s or "nausea" in s for s in symptoms_lower) and any("stomach" in s or "abdominal" in s for s in symptoms_lower):
        add_suggestion(
            "Possible gastroenteritis or food poisoning",
            "moderate",
            "Acute vomiting and abdominal pain are commonly due to gastroenteritis or foodborne causes; supportive care and hydration are important."
        )

    # Chest-related symptoms
    if any("chest" in s for s in symptoms_lower):
        add_suggestion(
            "Multiple possible causes (cardiac, pulmonary, musculoskeletal)",
            "unknown",
            "Chest pain can indicate many conditions including cardiac ischemia; seek immediate medical assessment for chest pain especially if associated with shortness of breath or sweating."
        )

    # Headache patterns
    if any("headache" in s for s in symptoms_lower):
        add_suggestion(
            "Tension headache or migraine",
            "moderate",
            "Headaches are a common symptom with many causes including tension-type headache and migraine; severe or sudden-onset headaches require urgent evaluation."
        )

    # If no clear match, provide a general suggestion
    if not suggestions:
        add_suggestion(
            "Requires professional medical evaluation",
            "unknown",
            "Symptoms are non-specific; consult a healthcare provider for appropriate history, examination, and testing to determine the cause."
        )

    # Return up to 4 suggestions to keep the list concise
    return suggestions[:4]


def generate_emergency_response() -> Dict:
    """Generate emergency response (compatible with symptom response schema)"""
    return {
        "severity_score": 100,
        "risk_level": "CRITICAL",
        "is_emergency": True,
        "symptoms_analysis": {},
        "recommendations": [
            "🚨 SEEK EMERGENCY CARE IMMEDIATELY (Call 911 or go to the ER)",
            "Do not delay. Seek immediate professional medical care."
        ],
        "message": "🚨 EMERGENCY DETECTED 🚨\n\nYour symptoms may indicate a medical emergency. Call emergency services immediately.",
        "disclaimer": MEDICAL_DISCLAIMER
    }
