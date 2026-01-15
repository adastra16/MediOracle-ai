import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export function MedicalDisclaimer({ compact = false, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const contentSpring = useSpring({
    maxHeight: isExpanded ? 200 : 0,
    opacity: isExpanded ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 30 },
  });

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 transition-colors"
        >
          <span className="text-lg">⚠️</span>
          <span className="font-medium">Medical Disclaimer</span>
          <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        <animated.div style={contentSpring} className="overflow-hidden">
          <div className="mt-3 p-4 rounded-xl bg-pink-50/50 border border-pink-200/30">
            <p className="text-sm text-text-secondary leading-relaxed">
              This information is for <strong>educational purposes only</strong> and is{' '}
              <strong>NOT a substitute</strong> for professional medical advice, diagnosis, or treatment.
              Always consult a qualified healthcare provider for medical concerns.
            </p>
          </div>
        </animated.div>
      </div>
    );
  }

  return (
    <div className={`
      relative overflow-hidden rounded-2xl
      bg-gradient-to-r from-pink-50/80 via-white/60 to-pink-50/80
      backdrop-blur-lg border border-pink-200/40
      p-5
      ${className}
    `}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-pink-md">
          <span className="text-2xl">⚠️</span>
        </div>
        
        <div className="flex-1">
          <h4 className="font-display font-semibold text-pink-700 mb-2">
            Important Medical Disclaimer
          </h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            This tool provides <strong className="text-pink-600">educational information only</strong> and is{' '}
            <strong className="text-pink-600">NOT a substitute</strong> for professional medical advice, 
            diagnosis, or treatment. Always consult with qualified healthcare providers for proper 
            evaluation and treatment. In case of emergency, call 911 immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

export function InlineDisclaimer({ className = '' }) {
  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 
      bg-pink-100/50 rounded-xl 
      text-xs text-pink-600
      ${className}
    `}>
      <span>⚠️</span>
      <span>Educational information only. Not medical advice.</span>
    </div>
  );
}

export default MedicalDisclaimer;

