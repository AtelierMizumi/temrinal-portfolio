"use client";

import { useEffect, useState } from 'react';

interface BackgroundSwitcherProps {
  defaultBackground?: string;
}

export const BackgroundSwitcher: React.FC<BackgroundSwitcherProps> = ({ 
  defaultBackground = 'catppuccin' 
}) => {
  const [background, setBackground] = useState(defaultBackground);

  // Available background options
  const backgrounds = {
    "catppuccin": "bg-gradient-to-br from-base to-mantle bg-fixed",
    "bozo": "bg-[url('/backgrounds/bozo.jpg')] bg-cover bg-fixed",
    "mountains": "bg-[url('/backgrounds/mountains.jpg')] bg-cover bg-fixed",
    "sequoia": "bg-[url('/backgrounds/sequoia.jpg')] bg-cover bg-fixed",
  };

  useEffect(() => {
    const handleBackgroundChange = (e: CustomEvent) => {
      if (e.detail && backgrounds[e.detail]) {
        setBackground(e.detail);
      }
    };

    // Add event listener for background changes from Terminal
    document.addEventListener('change-background', handleBackgroundChange as EventListener);
    
    return () => {
      document.removeEventListener('change-background', handleBackgroundChange as EventListener);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 -z-10 transition-all duration-500 ease-in-out ${backgrounds[background] || backgrounds.catppuccin}`}
    />
  );
};