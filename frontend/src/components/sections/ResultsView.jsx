import { useSpring, animated, useTrail } from '@react-spring/web';
import { GlassCard } from '../ui/GlassCard';
import { Button3D } from '../ui/Button3D';
import { InlineDisclaimer } from '../ui/MedicalDisclaimer';
import { useState } from 'react';

function ConfidenceGauge({ value }) {
  const percentage = Math.round(value * 100);
  const color = percentage >= 70 ? 'from-green-400 to-emerald-500' 
              : percentage >= 40 ? 'from-yellow-400 to-orange-500' 
              : 'from-red-400 to-pink-500';

  const gaugeSpring = useSpring({
    width: `${percentage}%`,
    from: { width: '0%' },
    config: { mass: 1, tension: 120, friction: 20 },
    delay: 500,
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Confidence</span>
        <span className="font-semibold text-pink-600">{percentage}%</span>
      </div>
      <div className="h-3 bg-pink-100/50 rounded-full overflow-hidden">
        <animated.div
          style={gaugeSpring}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
}

function SourceCard({ source, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-4 rounded-xl bg-white/30 border border-pink-200/30 hover:bg-white/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-pink-400/20 flex items-center justify-center text-xs font-bold text-pink-600">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-text-primary truncate">
              {source.source}
            </span>
          </div>
          <p className={`text-sm text-text-secondary ${isExpanded ? '' : 'line-clamp-2'}`}>
            {source.excerpt}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="px-2 py-1 rounded-lg bg-pink-100/50 text-xs font-medium text-pink-600">
            {(parseFloat(source.similarity) * 100).toFixed(0)}% match
          </span>
          {source.excerpt && source.excerpt.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-pink-500 hover:text-pink-600"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResultsView({ result, onNewQuery, onBack }) {
  const [showSources, setShowSources] = useState(true);

  const containerSpring = useSpring({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    config: { mass: 1, tension: 280, friction: 40 },
  });

  const cardTrail = useTrail(3, {
    from: { opacity: 0, y: 20, scale: 0.95 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: { mass: 1, tension: 280, friction: 40 },
    delay: 200,
  });

  if (!result) return null;

  const { response, sourcesUsed = [], confidence = 0, isDemoMode } = result;

  return (
    <animated.div style={containerSpring} className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button3D variant="ghost" onClick={onBack} icon="←">
          Back
        </Button3D>
        <Button3D variant="secondary" onClick={onNewQuery} icon="🔄">
          New Query
        </Button3D>
      </div>

      {/* Main Response Card */}
      <animated.div style={cardTrail[0]}>
        <GlassCard className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-pink-md">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-gradient mb-1">
                AI Response
              </h3>
              <p className="text-sm text-text-muted">
                Based on your uploaded medical documents
              </p>
            </div>
            {isDemoMode && (
              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                Demo Mode
              </span>
            )}
          </div>

          {/* Response content */}
          <div className="prose prose-pink max-w-none mb-6">
            <div className="p-6 rounded-2xl bg-white/40 border border-pink-200/30">
              <div className="whitespace-pre-wrap text-text-primary leading-relaxed">
                {response}
              </div>
            </div>
          </div>

          {/* Confidence gauge */}
          <ConfidenceGauge value={confidence} />

          {/* Disclaimer */}
          <div className="mt-6">
            <InlineDisclaimer />
          </div>
        </GlassCard>
      </animated.div>

      {/* Sources Card */}
      {sourcesUsed && sourcesUsed.length > 0 && (
        <animated.div style={cardTrail[1]}>
          <GlassCard className="p-6">
            <button
              onClick={() => setShowSources(!showSources)}
              className="w-full flex items-center justify-between mb-4"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-pink-400/20 flex items-center justify-center">
                  📚
                </span>
                <div className="text-left">
                  <h4 className="font-display font-semibold text-text-primary">
                    Sources Used
                  </h4>
                  <p className="text-sm text-text-muted">
                    {sourcesUsed.length} document{sourcesUsed.length !== 1 ? 's' : ''} referenced
                  </p>
                </div>
              </div>
              <span className={`text-pink-500 transition-transform ${showSources ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showSources && (
              <div className="space-y-3 animate-slide-down">
                {sourcesUsed.map((source, index) => (
                  <SourceCard key={index} source={source} index={index} />
                ))}
              </div>
            )}
          </GlassCard>
        </animated.div>
      )}

      {/* Action buttons */}
      <animated.div style={cardTrail[2]} className="flex justify-center gap-4 pt-4">
        <Button3D variant="neon" size="lg" onClick={onNewQuery} icon="💬">
          Ask Another Question
        </Button3D>
      </animated.div>
    </animated.div>
  );
}

export default ResultsView;

