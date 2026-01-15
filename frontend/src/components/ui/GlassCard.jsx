import { useSpring, animated } from '@react-spring/web';
import { useState } from 'react';

export function GlassCard({ 
  children, 
  className = '', 
  hover3D = true,
  glowOnHover = true,
  delay = 0,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const springProps = useSpring({
    transform: isHovered && hover3D
      ? 'perspective(1000px) rotateX(5deg) rotateY(-5deg) translateZ(20px) scale(1.02)'
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
    boxShadow: isHovered && glowOnHover
      ? '0 25px 50px rgba(255, 121, 198, 0.3), 0 0 30px rgba(255, 121, 198, 0.2)'
      : '0 10px 40px rgba(255, 121, 198, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    config: { mass: 1, tension: 280, friction: 60 },
    delay: delay,
  });

  return (
    <animated.div
      style={springProps}
      className={`
        relative overflow-hidden rounded-3xl
        bg-white/30 backdrop-blur-xl
        border border-white/40
        transition-colors duration-300
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-pink-500/5 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Hover glow overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-pink-400/5 pointer-events-none animate-fade-in" />
      )}
    </animated.div>
  );
}

export function FloatingCard({ children, className = '', animationDelay = 0, ...props }) {
  return (
    <div
      className={`animate-float ${className}`}
      style={{ animationDelay: `${animationDelay}s` }}
      {...props}
    >
      <GlassCard>
        {children}
      </GlassCard>
    </div>
  );
}

export default GlassCard;

