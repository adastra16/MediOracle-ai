/**
 * MediOracle AI - Sample Test Data Generator
 * Creates sample medical data for testing
 */

export const SAMPLE_MEDICAL_TEXTS = [
  {
    source: "general_health_guide.txt",
    text: `
    # Symptoms and When to Seek Care

    ## Common Cold Symptoms
    The common cold typically presents with:
    - Runny or stuffy nose
    - Sore throat
    - Cough
    - Sneezing
    - Mild fever
    - Body aches
    - Fatigue

    Most colds resolve within 7-10 days with rest and fluids.
    Seek medical attention if symptoms worsen or persist beyond 2 weeks.

    ## Flu Symptoms
    Influenza often causes more severe symptoms than the common cold:
    - High fever (above 100°F)
    - Severe body aches
    - Fatigue and weakness
    - Dry cough
    - Chills
    - Headache

    The flu can be serious and may require antiviral treatment.
    Vaccination is the best prevention.

    ## When to Seek Emergency Care
    Call 911 or go to the emergency room immediately if you experience:
    - Difficulty breathing
    - Chest pain or pressure
    - Confusion
    - Loss of consciousness
    - Severe allergic reaction
    - Uncontrolled bleeding
    - Severe abdominal pain
    `
  },
  {
    source: "diabetes_guide.txt",
    text: `
    # Understanding Diabetes

    Diabetes is a chronic condition affecting blood sugar levels.

    ## Types of Diabetes
    
    ### Type 1 Diabetes
    - Autoimmune condition where the pancreas doesn't produce insulin
    - Usually diagnosed in children and young adults
    - Requires insulin therapy
    - Symptoms include increased thirst, frequent urination, fatigue

    ### Type 2 Diabetes
    - Most common form (90-95% of cases)
    - Body doesn't use insulin effectively
    - Can often be managed with lifestyle changes
    - Risk factors include obesity and sedentary lifestyle

    ## Common Symptoms
    - Increased thirst
    - Frequent urination
    - Fatigue
    - Blurred vision
    - Slow-healing wounds
    - Tingling in extremities

    ## Management
    - Regular blood sugar monitoring
    - Healthy diet and exercise
    - Medication as prescribed
    - Regular medical check-ups

    ## Complications to Avoid
    - Heart disease
    - Kidney disease
    - Nerve damage (neuropathy)
    - Vision problems
    - Foot complications

    Always work with healthcare providers for proper management.
    `
  }
];

export const SAMPLE_SYMPTOMS = [
  {
    symptoms: ["fever", "cough", "sore throat"],
    expectedRisk: "MEDIUM",
    description: "Classic cold/flu symptoms"
  },
  {
    symptoms: ["chest pain", "difficulty breathing"],
    expectedRisk: "CRITICAL",
    description: "Emergency symptoms"
  },
  {
    symptoms: ["mild headache", "runny nose"],
    expectedRisk: "LOW",
    description: "Minor symptoms"
  },
  {
    symptoms: ["high fever", "severe fatigue", "chills"],
    expectedRisk: "HIGH",
    description: "Possible serious infection"
  }
];

export const TEST_QUERIES = [
  "What are the symptoms of diabetes?",
  "How long does the common cold last?",
  "When should I seek emergency medical care?",
  "What is the difference between type 1 and type 2 diabetes?",
  "What are the warning signs of the flu?"
];

/**
 * Generate sample PDF-like text for testing
 */
export function generateSampleMedicalPDF() {
  return `
    MEDICAL EDUCATION HANDBOOK
    
    This document provides educational information about common health conditions.
    
    DISCLAIMER: This is educational material only. Always consult with qualified
    healthcare providers for medical advice, diagnosis, or treatment.
    
    ${SAMPLE_MEDICAL_TEXTS.map(item => item.text).join("\n\n")}
    
    EMERGENCY CONTACT INFORMATION
    In case of medical emergency, call 911 immediately.
    Do not rely on this educational material for emergency situations.
  `;
}

/**
 * Export all test data
 */
export default {
  SAMPLE_MEDICAL_TEXTS,
  SAMPLE_SYMPTOMS,
  TEST_QUERIES,
  generateSampleMedicalPDF
};
