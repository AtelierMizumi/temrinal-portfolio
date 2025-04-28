"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { animate } from 'animejs';

type ThemeType = 'catppuccin' | 'bozo' | 'mountains' | 'sequoia';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  changeTheme: (theme?: ThemeType) => void;
  cycleTheme: () => void;
  accentColor: string;
  accentName: string;
  changeAccentColor: (color: string, name: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => null,
  changeTheme: () => null,
  cycleTheme: () => null,
  accentColor: 'hsl(277, 59%, 76%)', // Mauve default
  accentName: 'Mauve',
  changeAccentColor: () => null,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('system');
  const [mounted, setMounted] = useState(false);
  const [accentColor, setAccentColor] = useState<string>('hsl(277, 59%, 76%)'); // Mauve default
  const [accentName, setAccentName] = useState<string>('Mauve');

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

    // Load saved accent color
    const savedAccentColor = localStorage.getItem('terminal-portfolio-accent-color');
    const savedAccentName = localStorage.getItem('terminal-portfolio-accent-name');
    
    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
      document.documentElement.style.setProperty('--primary', savedAccentColor);
      document.documentElement.style.setProperty('--ring', savedAccentColor);
    }
    
    if (savedAccentName) {
      setAccentName(savedAccentName);
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

  // Change accent color function
  const changeAccentColor = (color: string, name: string) => {
    setAccentColor(color);
    setAccentName(name);
    
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--ring', color);
    
    localStorage.setItem('terminal-portfolio-accent-color', color);
    localStorage.setItem('terminal-portfolio-accent-name', name);
    
    // Animate color swatch if exists
    const colorSwatch = document.querySelector('.color-palette-button');
    if (colorSwatch) {
      animate(colorSwatch, {
        scale: [1, 1.2, 1],
        duration: 300,
        easing: 'easeInOutQuad'
      });
    }
  };
  
  // Return early if not mounted to avoid hydration issues
  if (!mounted) {
    return <>{children}</>;
  }
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, changeTheme, cycleTheme, accentColor, accentName, changeAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
