import { useSpring, animated } from '@react-spring/web';
import { useState } from 'react';

export function Button3D({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const springProps = useSpring({
    transform: isPressed
      ? 'translateY(2px) scale(0.98)'
      : isHovered
      ? 'translateY(-4px) scale(1.02)'
      : 'translateY(0px) scale(1)',
    boxShadow: isHovered
      ? '0 20px 40px rgba(255, 121, 198, 0.4), 0 0 30px rgba(255, 121, 198, 0.2)'
      : '0 10px 30px rgba(255, 121, 198, 0.3)',
    config: { mass: 1, tension: 400, friction: 30 },
  });

  const variants = {
    primary: `
      bg-gradient-to-r from-pink-500 via-accent to-pink-400
      text-white font-semibold
      hover:from-pink-400 hover:via-accent-dark hover:to-pink-500
    `,
    secondary: `
      bg-white/40 backdrop-blur-lg
      text-pink-600 font-semibold
      border border-pink-200/50
      hover:bg-white/60
    `,
    outline: `
      bg-transparent
      text-pink-500 font-semibold
      border-2 border-pink-500
      hover:bg-pink-500/10
    `,
    ghost: `
      bg-transparent
      text-pink-500 font-medium
      hover:bg-pink-500/10
    `,
    neon: `
      bg-gradient-to-r from-pink-500 to-accent-neon
      text-white font-bold
      shadow-neon
      hover:shadow-[0_0_30px_rgba(255,20,147,0.8)]
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
    xl: 'px-10 py-5 text-xl rounded-3xl',
  };

  return (
    <animated.button
      style={springProps}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden
        ${variants[variant]}
        ${sizes[size]}
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-4 focus:ring-pink-500/30
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      {...props}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            {icon && <span className="text-xl">{icon}</span>}
            {children}
          </>
        )}
      </span>
    </animated.button>
  );
}

export function IconButton3D({ icon, onClick, className = '', size = 'md', ...props }) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  return (
    <Button3D
      onClick={onClick}
      variant="secondary"
      className={`${sizes[size]} !p-0 !rounded-full ${className}`}
      {...props}
    >
      <span className="text-xl">{icon}</span>
    </Button3D>
  );
}

export default Button3D;

