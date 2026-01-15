import { useState } from 'react';
import { useSpring, animated, useTransition } from '@react-spring/web';
import { GlassCard } from '../ui/GlassCard';
import { Button3D } from '../ui/Button3D';
import { TextArea3D } from '../ui/Input3D';
import { MedicalDisclaimer, InlineDisclaimer } from '../ui/MedicalDisclaimer';

export function QueryPanel({ onSubmit, isLoading }) {
  const [query, setQuery] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const panelSpring = useSpring({
    from: { opacity: 0, y: 50, scale: 0.95 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: { mass: 1, tension: 280, friction: 40 },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query);
    }
  };

  const suggestions = [
    'What are the symptoms of diabetes?',
    'How does high blood pressure affect health?',
    'What causes migraines?',
    'Explain common cold vs flu differences',
  ];

  return (
    <animated.div style={panelSpring} className="w-full max-w-3xl mx-auto">
      <GlassCard className="p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 shadow-pink-lg">
            <span className="text-3xl">🔬</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gradient mb-2">
            Ask Medical Questions
          </h2>
          <p className="text-text-secondary">
            Get AI-powered insights from your uploaded medical documents
          </p>
        </div>

        {/* Medical Disclaimer */}
        {showDisclaimer && (
          <div className="mb-6">
            <MedicalDisclaimer compact />
          </div>
        )}

        {/* Query Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextArea3D
            label="Your Medical Question"
            placeholder="Type your health-related question here... (e.g., 'What are the symptoms of dengue fever?')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
          />

          {/* Quick suggestions */}
          <div>
            <p className="text-sm text-text-muted mb-3">💡 Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className="px-3 py-1.5 text-sm rounded-xl bg-pink-100/50 text-pink-600 hover:bg-pink-100 transition-colors border border-pink-200/30"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button3D
              type="submit"
              variant="neon"
              size="lg"
              loading={isLoading}
              disabled={!query.trim()}
              icon="🔍"
            >
              {isLoading ? 'Searching...' : 'Search Knowledge Base'}
            </Button3D>
            
            {query && (
              <Button3D
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => setQuery('')}
                icon="✕"
              >
                Clear
              </Button3D>
            )}
          </div>
        </form>

        {/* Inline disclaimer */}
        <div className="mt-6 flex justify-center">
          <InlineDisclaimer />
        </div>
      </GlassCard>
    </animated.div>
  );
}

export default QueryPanel;

