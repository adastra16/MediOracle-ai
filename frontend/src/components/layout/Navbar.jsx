import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Button3D } from '../ui/Button3D';

export function Navbar({ currentView, onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navSpring = useSpring({
    backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0)',
    backdropFilter: isScrolled ? 'blur(20px)' : 'blur(0px)',
    boxShadow: isScrolled ? '0 4px 30px rgba(255, 121, 198, 0.1)' : '0 0 0 transparent',
    config: { mass: 1, tension: 280, friction: 40 },
  });

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'query', label: 'Ask Question', icon: '💬' },
    { id: 'symptoms', label: 'Symptoms', icon: '🩺' },
    { id: 'upload', label: 'Upload Docs', icon: '📄' },
  ];

  return (
    <animated.nav
      style={navSpring}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-pink-sm group-hover:shadow-pink-md transition-shadow">
              <span className="text-xl">🔬</span>
            </div>
            <span className="font-display font-bold text-xl text-gradient hidden sm:block">
              MediOracle AI
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl
                  transition-all duration-300
                  ${currentView === item.id
                    ? 'bg-pink-500/20 text-pink-600 font-medium'
                    : 'text-text-secondary hover:bg-pink-500/10 hover:text-pink-500'
                  }
                `}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button3D
              variant="primary"
              size="sm"
              onClick={() => onNavigate('query')}
            >
              Get Started
            </Button3D>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/40 backdrop-blur-lg"
          >
            <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-pink-200/30 animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-300
                  ${currentView === item.id
                    ? 'bg-pink-500/20 text-pink-600 font-medium'
                    : 'text-text-secondary hover:bg-pink-500/10'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </animated.nav>
  );
}

export default Navbar;

