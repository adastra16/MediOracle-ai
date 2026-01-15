import { useSpring, animated, useTrail } from '@react-spring/web';
import { HeroScene } from '../3d/Scene3D';
import { Button3D } from '../ui/Button3D';
import { useEffect, useState } from 'react';

export function Hero({ onGetStarted }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animated title words
  const titleWords = ['MediOracle', 'AI'];
  const subtitleWords = ['Intelligent', 'Healthcare', 'Assistant'];

  const titleTrail = useTrail(titleWords.length, {
    from: { opacity: 0, y: 50, scale: 0.8 },
    to: { opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50, scale: isVisible ? 1 : 0.8 },
    config: { mass: 1, tension: 280, friction: 40 },
    delay: 200,
  });

  const subtitleTrail = useTrail(subtitleWords.length, {
    from: { opacity: 0, y: 30 },
    to: { opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 },
    config: { mass: 1, tension: 280, friction: 40 },
    delay: 600,
  });

  const ctaSpring = useSpring({
    from: { opacity: 0, y: 40, scale: 0.9 },
    to: { opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40, scale: isVisible ? 1 : 0.9 },
    config: { mass: 1, tension: 200, friction: 30 },
    delay: 1000,
  });

  const decorSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: isVisible ? 1 : 0 },
    config: { duration: 2000 },
    delay: 500,
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <HeroScene />
      
      {/* Gradient overlays */}
      <animated.div 
        style={decorSpring}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-light/30 to-surface-light/80 pointer-events-none"
      />
      
      {/* Floating decorative elements */}
      <animated.div style={decorSpring} className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-400/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-2xl animate-float-fast" />
      </animated.div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <animated.div 
          style={ctaSpring}
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/40 backdrop-blur-lg border border-white/50 shadow-pink-sm"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium text-text-secondary">AI-Powered Healthcare Assistant</span>
        </animated.div>

        {/* Main title */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <div className="flex flex-wrap justify-center gap-x-4">
            {titleTrail.map((style, index) => (
              <animated.span
                key={index}
                style={style}
                className={index === 0 ? 'text-gradient' : 'text-accent-neon'}
              >
                {titleWords[index]}
              </animated.span>
            ))}
          </div>
        </h1>

        {/* Decorative line */}
        <animated.div 
          style={ctaSpring}
          className="w-32 h-1 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-400 via-accent to-pink-300"
        />

        {/* Subtitle */}
        <div className="flex flex-wrap justify-center gap-x-3 mb-10">
          {subtitleTrail.map((style, index) => (
            <animated.span
              key={index}
              style={style}
              className="text-xl md:text-2xl lg:text-3xl font-light text-text-secondary"
            >
              {subtitleWords[index]}
            </animated.span>
          ))}
        </div>

        {/* Description */}
        <animated.p 
          style={ctaSpring}
          className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Experience the future of medical information with our intelligent RAG-powered assistant. 
          Upload documents, ask questions, and get AI-enhanced insights.
        </animated.p>

        {/* CTA Buttons */}
        <animated.div style={ctaSpring} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button3D
            variant="neon"
            size="xl"
            onClick={onGetStarted}
            icon="🔬"
          >
            Ask a Medical Question
          </Button3D>
          
          <Button3D
            variant="secondary"
            size="xl"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            icon="✨"
          >
            Explore Features
          </Button3D>
        </animated.div>

        {/* Trust indicators */}
        <animated.div 
          style={ctaSpring}
          className="mt-16 flex flex-wrap justify-center gap-8 text-text-muted"
        >
          {[
            { icon: '🔒', label: 'Privacy First' },
            { icon: '⚡', label: 'Real-time AI' },
            { icon: '📚', label: 'RAG Enhanced' },
            { icon: '🏥', label: 'Medical Grade' },
          ].map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/30 backdrop-blur-sm"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </animated.div>
      </div>

      {/* Scroll indicator */}
      <animated.div 
        style={ctaSpring}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-text-muted animate-bounce-soft">
          <span className="text-xs font-medium">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-pink-300/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-pink-400 animate-bounce" />
          </div>
        </div>
      </animated.div>
    </section>
  );
}

export default Hero;

