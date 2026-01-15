import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { FloatingPanel } from '../components/3d/FloatingPanel';
import { gsap } from 'gsap';

const symptomOptions = [
  { icon: '🤒', label: 'Fever', value: 'fever' },
  { icon: '🤕', label: 'Headache', value: 'headache' },
  { icon: '😷', label: 'Cough', value: 'cough' },
  { icon: '🤢', label: 'Nausea', value: 'nausea' },
  { icon: '😴', label: 'Fatigue', value: 'fatigue' },
  { icon: '💔', label: 'Chest Pain', value: 'chest pain' },
  { icon: '🤧', label: 'Runny Nose', value: 'runny nose' },
  { icon: '😵', label: 'Dizziness', value: 'dizziness' },
];

export function SymptomScene3D({ onAnalyze, result, loading }) {
  const [symptoms, setSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState(null);

  const inputPanelRef = useRef();
  const resultPanelRef = useRef();

  useFrame(() => {
    if (inputPanelRef.current) {
      inputPanelRef.current.position.y = 1 + Math.sin(Date.now() * 0.001) * 0.1;
    }
    if (resultPanelRef.current && result) {
      resultPanelRef.current.position.y = -1.5 + Math.sin(Date.now() * 0.0008) * 0.1;
    }
  });

  const toggleSymptom = (value) => {
    setSymptoms(prev => 
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    );
  };

  const handleAnalyze = () => {
    if (!age || !gender || !duration || symptoms.length === 0) {
      setError('Please fill all required fields');
      return;
    }

    const allSymptoms = [...symptoms];
    if (customSymptom.trim()) {
      allSymptoms.push(...customSymptom.split(',').map(s => s.trim()).filter(Boolean));
    }

    onAnalyze({
      symptoms: allSymptoms,
      age: parseInt(age),
      gender,
      duration: parseInt(duration),
    });

    // Animate result in
    if (resultPanelRef.current) {
      gsap.fromTo(resultPanelRef.current.scale,
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1, duration: 0.8, ease: 'back.out(1.7)' }
      );
    }
  };

  const getRiskColor = (riskLevel) => {
    if (riskLevel === 'EMERGENCY' || riskLevel === 'CRITICAL') return '#ff0000';
    if (riskLevel === 'HIGH') return '#ff6b00';
    if (riskLevel === 'MODERATE') return '#ffa500';
    return '#00ff00';
  };

  return (
    <>
      {/* Input Panel */}
      <group ref={inputPanelRef}>
        <FloatingPanel
          position={[0, 1, 0]}
          width={6}
          height={5}
          glowColor="#ff79c6"
        >
          <Html
            position={[0, 1, 0]}
            transform
            style={{ width: '600px', pointerEvents: 'auto' }}
          >
            <div style={{ padding: '20px' }}>
              {/* Patient Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age *"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid rgba(255, 121, 198, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#2d1f3d',
                  }}
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid rgba(255, 121, 198, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#2d1f3d',
                  }}
                >
                  <option value="">Gender *</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Duration (days) *"
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid rgba(255, 121, 198, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#2d1f3d',
                  }}
                />
              </div>

              {/* Symptoms */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  {symptomOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleSymptom(opt.value)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: symptoms.includes(opt.value) 
                          ? '2px solid #ff79c6' 
                          : '2px solid rgba(255, 121, 198, 0.3)',
                        background: symptoms.includes(opt.value)
                          ? 'rgba(255, 121, 198, 0.2)'
                          : 'rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        fontSize: '24px',
                      }}
                    >
                      {opt.icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  placeholder="Additional symptoms (comma-separated)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid rgba(255, 121, 198, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#2d1f3d',
                  }}
                />
              </div>

              {error && (
                <div style={{ 
                  padding: '10px', 
                  marginBottom: '12px', 
                  borderRadius: '8px', 
                  background: 'rgba(255, 0, 0, 0.1)',
                  color: '#ff0000',
                  fontSize: '14px',
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || !age || !gender || !duration || symptoms.length === 0}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: (age && gender && duration && symptoms.length > 0 && !loading)
                    ? 'linear-gradient(135deg, #ff79c6, #ff1493)'
                    : '#ccc',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (age && gender && duration && symptoms.length > 0 && !loading) ? 'pointer' : 'not-allowed',
                }}
              >
                {loading ? '🔬 Analyzing...' : '🔬 Analyze Symptoms'}
              </button>
            </div>
          </Html>
        </FloatingPanel>
      </group>

      {/* Results */}
      {result && !result.error && (
        <group ref={resultPanelRef} position={[0, -1.5, 0]}>
          {/* Emergency Alert */}
          {(result.risk_level === 'CRITICAL' || result.risk_level === 'EMERGENCY') && (
            <FloatingPanel
              position={[0, 1.5, 0]}
              width={6}
              height={1.5}
              glowColor="#ff0000"
            >
              <Html transform style={{ width: '600px', pointerEvents: 'auto' }}>
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#ff0000',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}>
                  🚨 EMERGENCY - Seek Immediate Medical Care
                </div>
              </Html>
            </FloatingPanel>
          )}

          {/* Severity Score */}
          <FloatingPanel
            position={[0, 0, 0]}
            width={4}
            height={2}
            glowColor={getRiskColor(result.risk_level)}
          >
            <Html transform style={{ width: '400px', pointerEvents: 'auto' }}>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: getRiskColor(result.risk_level) }}>
                  {result.severity_score}/100
                </div>
                <div style={{ fontSize: '18px', color: '#2d1f3d', marginTop: '8px' }}>
                  Risk Level: {result.risk_level}
                </div>
              </div>
            </Html>
          </FloatingPanel>

          {/* Conditions */}
          {result.possible_conditions && result.possible_conditions.length > 0 && (
            <FloatingPanel
              position={[0, -2, 0]}
              width={6}
              height={3}
              glowColor="#ff79c6"
            >
              <Html transform style={{ width: '600px', maxHeight: '300px', overflow: 'auto', pointerEvents: 'auto' }}>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ marginBottom: '12px', color: '#2d1f3d' }}>Possible Conditions (Educational)</h3>
                  {result.possible_conditions.map((cond, i) => (
                    <div key={i} style={{
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '8px',
                      background: 'rgba(255, 121, 198, 0.1)',
                    }}>
                      <div style={{ fontWeight: '600', color: '#2d1f3d' }}>{cond.condition}</div>
                      <div style={{ fontSize: '12px', color: '#6b5b7a', marginTop: '4px' }}>{cond.rationale}</div>
                    </div>
                  ))}
                </div>
              </Html>
            </FloatingPanel>
          )}

          {/* Recommendations */}
          {result.recommendations && (
            <FloatingPanel
              position={[0, -4.5, 0]}
              width={5}
              height={2.5}
              glowColor="#ff1493"
            >
              <Html transform style={{ width: '500px', pointerEvents: 'auto' }}>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ marginBottom: '12px', color: '#2d1f3d' }}>💡 Recommendations</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {result.recommendations.map((rec, i) => (
                      <li key={i} style={{ marginBottom: '8px', color: '#2d1f3d' }}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </Html>
            </FloatingPanel>
          )}
        </group>
      )}
    </>
  );
}

export default SymptomScene3D;

