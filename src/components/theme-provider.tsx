"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { animate } from "animejs";

type Theme = "dark" | "light";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [storageKey]);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove class and add new theme class
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Persist to local storage
    localStorage.setItem(storageKey, theme);
    
    // Add animation for smooth transition
    const elements = document.querySelectorAll(".window, .taskbar, .arch-menu, button");
    if (elements.length > 0) {
      animate(elements, {
        opacity: [0.9, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  }, [storageKey, theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
  };

  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
