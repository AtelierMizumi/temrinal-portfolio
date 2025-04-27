'use client';

import { useState, useEffect, ReactNode } from 'react';
import TopBar from './TopBar';

interface WindowWrapperProps {
  children: ReactNode;
}

const WindowWrapper = ({ children }: WindowWrapperProps) => {
  const [background, setBackground] = useState('gradient-blue');
  const [wobbleEnabled, setWobbleEnabled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Handle background change events from terminal
    const handleBackgroundChange = (e: CustomEvent) => {
      setBackground(e.detail);
      
      // Play click sound
      const audio = new Audio('/sounds/click.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {
        // Ignore errors - browsers may block autoplay
      });
    };
    
    // Handle wobble toggle events from terminal
    const handleToggleWobble = (e: CustomEvent) => {
      setWobbleEnabled(e.detail);
    };
    
    // Track mouse position for wobble effect
    const handleMouseMove = (e: MouseEvent) => {
      if (wobbleEnabled) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };
    
    // Add event listeners
    document.addEventListener('change-background', handleBackgroundChange as EventListener);
    document.addEventListener('toggle-wobble', handleToggleWobble as EventListener);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('change-background', handleBackgroundChange as EventListener);
      document.removeEventListener('toggle-wobble', handleToggleWobble as EventListener);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [wobbleEnabled]);
  
  // Calculate wobble effect transform based on mouse position
  const calculateWobbleTransform = () => {
    if (!wobbleEnabled || !mounted) return '';
    
    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calculate distance from center as percentage
    const centerX = windowWidth / 2;
    const centerY = windowHeight / 2;
    
    // Calculate offset from center (max 5 degrees rotation)
    const offsetX = ((mousePos.x - centerX) / centerX) * 3;
    const offsetY = ((mousePos.y - centerY) / centerY) * 2;
    
    // Return transform property with subtle rotation and perspective
    return `perspective(1000px) rotateX(${-offsetY}deg) rotateY(${offsetX}deg)`;
  };
  
  // Get the current background class
  const getBackgroundClass = () => {
    switch (background) {
      case 'gradient-blue': return 'bg-gradient-to-br from-base to-mantle';
      case 'gradient-purple': return 'bg-gradient-to-br from-mauve/30 to-base';
      case 'gradient-green': return 'bg-gradient-to-br from-green/30 to-base';
      case 'solid-dark': return 'bg-base';
      case 'catppuccin': return 'bg-[url("/catppuccin-bg.jpg")]';
      case 'matrix': return 'bg-[url("/matrix.gif")]';
      case 'mountains': return 'bg-[url("/mountains.jpg")]';
      default: return 'bg-gradient-to-br from-base to-mantle';
    }
  };

  if (!mounted) {
    return null; // Prevent SSR flash
  }

  return (
    <div className={`min-h-screen ${getBackgroundClass()} bg-cover bg-center flex flex-col`}>
      <TopBar onBackgroundChange={setBackground} />
      
      <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {/* Window with wobble effect */}
        <div 
          className="w-full max-w-4xl rounded-lg overflow-hidden shadow-xl border border-surface0/40 transition-all duration-300 ease-out animate-fadeIn"
          style={{
            transform: calculateWobbleTransform(),
            transition: wobbleEnabled ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out'
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default WindowWrapper;