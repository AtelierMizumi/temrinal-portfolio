"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { animate } from 'animejs';

type ThemeType = 'catppuccin' | 'bozo' | 'mountains' | 'sequoia';

interface ThemeContextType {
  theme: ThemeType;
  changeTheme: (theme?: ThemeType) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'catppuccin',
  changeTheme: () => {},
  cycleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('catppuccin');
  const [mounted, setMounted] = useState(false);

  // Available themes
  const themes: ThemeType[] = ['catppuccin', 'bozo', 'mountains', 'sequoia'];

  // Set mounted to true on client
  useEffect(() => {
    setMounted(true);
    
    // Try to get theme from localStorage
    const savedTheme = localStorage.getItem('terminal-portfolio-theme');
    if (savedTheme && themes.includes(savedTheme as ThemeType)) {
      setTheme(savedTheme as ThemeType);
    }
  }, []);

  // Change theme function
  const changeTheme = (newTheme?: ThemeType) => {
    if (newTheme && themes.includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem('terminal-portfolio-theme', newTheme);
      
      // Dispatch an event that other components can listen to
      document.dispatchEvent(
        new CustomEvent('change-background', { detail: newTheme })
      );
      
      // Animate theme button
      const themeButton = document.querySelector('.theme-button');
      if (themeButton) {
        animate(themeButton, {
          scale: [1, 1.2, 1],
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
    }
  };
  
  // Cycle through themes
  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    changeTheme(themes[nextIndex]);
  };
  
  // Return early if not mounted to avoid hydration issues
  if (!mounted) {
    return <>{children}</>;
  }
  
  return (
    <ThemeContext.Provider value={{ theme, changeTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
