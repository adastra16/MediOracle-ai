import { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

export function Input3D({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  icon,
  error,
  className = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  const springProps = useSpring({
    transform: isFocused
      ? 'translateY(-2px) scale(1.01)'
      : 'translateY(0px) scale(1)',
    boxShadow: isFocused
      ? '0 15px 40px rgba(255, 121, 198, 0.25), 0 0 0 3px rgba(255, 121, 198, 0.3)'
      : '0 8px 25px rgba(255, 121, 198, 0.1)',
    config: { mass: 1, tension: 300, friction: 30 },
  });

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">
          {label}
        </label>
      )}
      
      <animated.div
        style={springProps}
        className="relative"
      >
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 text-xl z-10">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-5 py-4 ${icon ? 'pl-12' : ''}
            bg-white/50 backdrop-blur-lg
            border-2 border-white/40
            rounded-2xl
            text-text-primary placeholder:text-text-muted
            transition-all duration-300
            focus:bg-white/70 focus:border-pink-300
            ${error ? 'border-red-300 focus:border-red-400' : ''}
          `}
          {...props}
        />
        
        {/* Glow effect on focus */}
        {isFocused && (
          <div className="absolute inset-0 -z-10 rounded-2xl bg-pink-500/10 blur-xl" />
        )}
      </animated.div>
      
      {error && (
        <p className="mt-2 text-sm text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
}

export function TextArea3D({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  error,
  className = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  const springProps = useSpring({
    transform: isFocused
      ? 'translateY(-2px) scale(1.01)'
      : 'translateY(0px) scale(1)',
    boxShadow: isFocused
      ? '0 15px 40px rgba(255, 121, 198, 0.25), 0 0 0 3px rgba(255, 121, 198, 0.3)'
      : '0 8px 25px rgba(255, 121, 198, 0.1)',
    config: { mass: 1, tension: 300, friction: 30 },
  });

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2 ml-1">
          {label}
        </label>
      )}
      
      <animated.div style={springProps} className="relative">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-5 py-4
            bg-white/50 backdrop-blur-lg
            border-2 border-white/40
            rounded-2xl
            text-text-primary placeholder:text-text-muted
            transition-all duration-300
            focus:bg-white/70 focus:border-pink-300
            resize-none
            ${error ? 'border-red-300 focus:border-red-400' : ''}
          `}
          {...props}
        />
        
        {isFocused && (
          <div className="absolute inset-0 -z-10 rounded-2xl bg-pink-500/10 blur-xl" />
        )}
      </animated.div>
      
      {error && (
        <p className="mt-2 text-sm text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
}

export default Input3D;

