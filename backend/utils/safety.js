/**
 * Medical Safety Disclaimers and Guardrails
 */

export const MEDICAL_DISCLAIMER = `
⚠️ **IMPORTANT MEDICAL DISCLAIMER**

This AI assistant provides general educational information about health topics.
It is NOT a substitute for professional medical advice, diagnosis, or treatment.

🚨 **DO NOT use this tool for:**
- Diagnosing medical conditions
- Self-treating serious symptoms
- Replacing professional medical consultation
- Emergency medical situations

✅ **ALWAYS:**
- Consult a qualified healthcare provider for personalized advice
- Seek emergency services (911) for life-threatening symptoms
- Report concerning symptoms to a doctor immediately

**Terms of Use:**
By using this tool, you acknowledge and agree that:
1. Information is for educational purposes only
2. You assume full responsibility for any decisions made based on this information
3. The service provider is not liable for misuse or adverse outcomes

Please use responsibly and prioritize your health and safety above all else.
`;

export const EMERGENCY_KEYWORDS = [
  'chest pain',
  'breathing difficulty',
  'loss of consciousness',
  'severe bleeding',
  'internal bleeding',
  'bleeding internally',
  'vomiting blood',
  'blood in stool',
  'blood in urine',
  'bleeding from rectum',
  'poisoning',
  'allergic reaction',
  'stroke',
  'cardiac arrest',
  'severe trauma',
  'suicide',
  'overdose',
  'severe injury',
  'broken bone',
  'head injury',
  'severe burn',
  'difficulty breathing',
  'shortness of breath',
  'severe pain'
];

/**
 * Check if user input contains emergency keywords
 * @param {string} userInput - User's input text
 * @returns {boolean} - True if emergency keyword detected
 */
export function detectEmergency(userInput) {
  if (!userInput || typeof userInput !== 'string') return false;
  const lowerInput = userInput.toLowerCase();
  
  // Check for emergency keywords
  const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some(keyword => {
    const keywordLower = keyword.toLowerCase();
    return lowerInput.includes(keywordLower);
  });
  
  // Also check for variations and related terms
  const emergencyPatterns = [
    /\binternal\s+bleeding\b/i,
    /\bbleeding\s+internally\b/i,
    /\bhigh\s+fever\b.*\binternal\s+bleeding\b/i,
    /\binternal\s+bleeding\b.*\bhigh\s+fever\b/i,
  ];
  
  const matchesPattern = emergencyPatterns.some(pattern => pattern.test(userInput));
  
  return hasEmergencyKeyword || matchesPattern;
}

/**
 * Generate emergency response
 * @returns {object} - Emergency response object
 */
export function generateEmergencyResponse() {
  return {
    isEmergency: true,
    message: `🚨 EMERGENCY DETECTED 🚨

Your symptoms may indicate a medical emergency.

**IMMEDIATE ACTION REQUIRED:**
📞 Call 911 (US) or your local emergency number
🏥 Go to the nearest emergency room immediately
⏰ Do NOT wait for a response from an AI

**DO NOT rely on this AI for emergency situations.**

Your safety is paramount. Please seek immediate professional medical care.`,
    confidence: 1.0
  };
}

/**
 * Add safety footer to all responses
 * @param {string} response - Original response
 * @returns {string} - Response with safety footer
 */
export function addSafetyFooter(response) {
  return `${response}\n\n---\n${MEDICAL_DISCLAIMER}`;
}

/**
 * Validate response for medical claims
 * @param {string} response - AI-generated response
 * @returns {boolean} - True if response is safe
 */
export function validateMedicalResponse(response) {
  const dangerousPhrases = [
    'you have',
    'you definitely have',
    'you must have',
    'diagnosis is',
    'i diagnose',
    'confirmed diagnosis'
  ];

  const lowerResponse = response.toLowerCase();
  const hasDangerousPhrase = dangerousPhrases.some(phrase =>
    lowerResponse.includes(phrase)
  );

  return !hasDangerousPhrase;
}

/**
 * Enforce medical response constraints
 * @param {string} response - Response to enforce constraints on
 * @returns {string} - Constrained response
 */
export function enforceConstraints(response) {
  let constrainedResponse = response;

  // Replace diagnostic claims with educational language
  constrainedResponse = constrainedResponse.replace(
    /you have (\w+)/gi,
    'these symptoms might be associated with $1, but only a doctor can diagnose'
  );

  constrainedResponse = constrainedResponse.replace(
    /diagnosis is (\w+)/gi,
    'this could potentially be related to $1, but professional evaluation is needed'
  );

  // Add safety note if missing
  if (!constrainedResponse.toLowerCase().includes('consult')) {
    constrainedResponse += '\n\n**Please consult with a healthcare professional for proper evaluation and treatment.**';
  }

  return constrainedResponse;
}

export default {
  MEDICAL_DISCLAIMER,
  EMERGENCY_KEYWORDS,
  detectEmergency,
  generateEmergencyResponse,
  addSafetyFooter,
  validateMedicalResponse,
  enforceConstraints
};
