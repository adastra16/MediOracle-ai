import { useState } from 'react';
import { useSpring, animated, useTrail } from '@react-spring/web';
import { GlassCard } from '../ui/GlassCard';
import { Button3D } from '../ui/Button3D';
import { Input3D, TextArea3D } from '../ui/Input3D';
import { MedicalDisclaimer, InlineDisclaimer } from '../ui/MedicalDisclaimer';

// 3D-style symptom icons
const symptomIcons = [
  { icon: '🤒', label: 'Fever', value: 'fever' },
  { icon: '🤕', label: 'Headache', value: 'headache' },
  { icon: '😷', label: 'Cough', value: 'cough' },
  { icon: '🤢', label: 'Nausea', value: 'nausea' },
  { icon: '😴', label: 'Fatigue', value: 'fatigue' },
  { icon: '💔', label: 'Chest Pain', value: 'chest pain' },
  { icon: '🤧', label: 'Runny Nose', value: 'runny nose' },
  { icon: '😵', label: 'Dizziness', value: 'dizziness' },
];

function SymptomButton({ icon, label, isSelected, onClick }) {
  const springProps = useSpring({
    transform: isSelected 
      ? 'scale(1.05) translateY(-4px)' 
      : 'scale(1) translateY(0px)',
    boxShadow: isSelected
      ? '0 15px 30px rgba(255, 121, 198, 0.4), 0 0 0 3px rgba(255, 121, 198, 0.5)'
      : '0 8px 20px rgba(255, 121, 198, 0.15)',
    config: { mass: 1, tension: 400, friction: 30 },
  });

  return (
    <animated.button
      style={springProps}
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-2 p-4 rounded-2xl
        transition-colors duration-300
        ${isSelected 
          ? 'bg-gradient-to-br from-pink-400 to-pink-500 text-white' 
          : 'bg-white/40 text-text-primary hover:bg-white/60'
        }
        border ${isSelected ? 'border-pink-300' : 'border-white/40'}
      `}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center">
          <span className="text-pink-500 text-xs">✓</span>
        </div>
      )}
    </animated.button>
  );
}

function SeverityGauge({ score, riskLevel }) {
  const getColor = () => {
    if (score >= 80) return { bg: 'from-red-400 to-red-600', text: 'text-red-600' };
    if (score >= 60) return { bg: 'from-orange-400 to-orange-600', text: 'text-orange-600' };
    if (score >= 40) return { bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-600' };
    return { bg: 'from-green-400 to-green-600', text: 'text-green-600' };
  };

  const colors = getColor();

  const gaugeSpring = useSpring({
    width: `${score}%`,
    from: { width: '0%' },
    config: { mass: 1, tension: 80, friction: 20 },
    delay: 300,
  });

  const scoreSpring = useSpring({
    number: score,
    from: { number: 0 },
    config: { mass: 1, tension: 80, friction: 20 },
    delay: 300,
  });

  return (
    <div className="p-6 rounded-2xl bg-white/40 border border-pink-200/30">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display font-semibold text-text-primary">Severity Score</h4>
        <div className="flex items-center gap-2">
          <animated.span className={`text-3xl font-bold ${colors.text}`}>
            {scoreSpring.number.to(n => Math.round(n))}
          </animated.span>
          <span className="text-text-muted">/100</span>
        </div>
      </div>
      
      <div className="h-4 bg-pink-100/50 rounded-full overflow-hidden mb-4">
        <animated.div
          style={gaugeSpring}
          className={`h-full rounded-full bg-gradient-to-r ${colors.bg}`}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">Risk Level:</span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
          riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
          riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {riskLevel}
        </span>
      </div>
    </div>
  );
}

function ConditionCard({ condition, index }) {
  const cardSpring = useSpring({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    delay: index * 100,
    config: { mass: 1, tension: 280, friction: 40 },
  });

  return (
    <animated.div
      style={cardSpring}
      className="p-4 rounded-xl bg-white/40 border border-pink-200/30 hover:bg-white/60 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h5 className="font-semibold text-text-primary mb-1">{condition.condition}</h5>
          <p className="text-sm text-text-secondary">{condition.rationale}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400/20 to-pink-500/20 flex items-center justify-center">
            <span className="text-lg font-bold text-pink-600">
              {Math.round(condition.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </animated.div>
  );
}

export function SymptomAnalyzer({ onAnalyze, isLoading, result }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptoms, setCustomSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const containerSpring = useSpring({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 280, friction: 40 },
  });

  const toggleSymptom = (value) => {
    setSelectedSymptoms(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allSymptoms = [
      ...selectedSymptoms,
      ...customSymptoms.split(',').map(s => s.trim()).filter(Boolean)
    ];
    
    if (allSymptoms.length > 0) {
      onAnalyze({
        symptoms: allSymptoms,
        age: age ? parseInt(age) : null,
        gender: gender || null,
      });
    }
  };

  const iconTrail = useTrail(symptomIcons.length, {
    from: { opacity: 0, scale: 0.8, y: 20 },
    to: { opacity: 1, scale: 1, y: 0 },
    config: { mass: 1, tension: 280, friction: 40 },
    delay: 200,
  });

  return (
    <animated.div style={containerSpring} className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input Panel */}
      <GlassCard className="p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 shadow-pink-lg">
            <span className="text-3xl">🩺</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gradient mb-2">
            Symptom Analyzer
          </h2>
          <p className="text-text-secondary">
            Select your symptoms for an educational health assessment
          </p>
        </div>

        <MedicalDisclaimer className="mb-8" />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quick symptom selection */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-4">
              Quick Select Symptoms
            </label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {iconTrail.map((style, index) => (
                <animated.div key={symptomIcons[index].value} style={style}>
                  <SymptomButton
                    icon={symptomIcons[index].icon}
                    label={symptomIcons[index].label}
                    isSelected={selectedSymptoms.includes(symptomIcons[index].value)}
                    onClick={() => toggleSymptom(symptomIcons[index].value)}
                  />
                </animated.div>
              ))}
            </div>
          </div>

          {/* Custom symptoms */}
          <TextArea3D
            label="Additional Symptoms (comma-separated)"
            placeholder="Enter any other symptoms... (e.g., sore throat, body aches)"
            value={customSymptoms}
            onChange={(e) => setCustomSymptoms(e.target.value)}
            rows={2}
          />

          {/* Optional info */}
          <div className="grid grid-cols-2 gap-4">
            <Input3D
              label="Age (Optional)"
              placeholder="Enter age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">
                Gender (Optional)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-5 py-4 bg-white/50 backdrop-blur-lg border-2 border-white/40 rounded-2xl text-text-primary focus:bg-white/70 focus:border-pink-300 transition-all"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-center pt-4">
            <Button3D
              type="submit"
              variant="neon"
              size="lg"
              loading={isLoading}
              disabled={selectedSymptoms.length === 0 && !customSymptoms.trim()}
              icon="🔬"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Symptoms'}
            </Button3D>
          </div>
        </form>
      </GlassCard>

      {/* Results */}
      {result && (
        <GlassCard className="p-8 animate-slide-up">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-10 rounded-xl bg-pink-400/20 flex items-center justify-center text-xl">
              📊
            </span>
            <h3 className="font-display text-xl font-bold text-text-primary">
              Analysis Results
            </h3>
          </div>

          {/* Severity gauge */}
          {result.severity_score !== undefined && (
            <div className="mb-6">
              <SeverityGauge 
                score={result.severity_score} 
                riskLevel={result.risk_level || 'LOW'} 
              />
            </div>
          )}

          {/* Possible conditions */}
          {result.possible_conditions && result.possible_conditions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-text-primary mb-4">
                Possible Conditions (Educational)
              </h4>
              <div className="space-y-3">
                {result.possible_conditions.map((condition, index) => (
                  <ConditionCard key={index} condition={condition} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-200/30">
              <h4 className="font-semibold text-pink-700 mb-3">💡 Recommendations</h4>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-pink-400 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <InlineDisclaimer />
          </div>
        </GlassCard>
      )}
    </animated.div>
  );
}

export default SymptomAnalyzer;

