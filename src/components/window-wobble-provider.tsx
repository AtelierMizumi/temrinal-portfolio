"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { animate } from 'animejs';

interface WobbleContextType {
  wobbleEnabled: boolean;
  toggleWobble: () => void;
}

const WobbleContext = createContext<WobbleContextType>({
  wobbleEnabled: true,
  toggleWobble: () => {},
});

export const useWobbleEffect = () => useContext(WobbleContext);

interface WobbleProviderProps {
  children: ReactNode;
}

export const WobbleProvider: React.FC<WobbleProviderProps> = ({ children }) => {
  const [wobbleEnabled, setWobbleEnabled] = useState(true);

  const toggleWobble = () => {
    setWobbleEnabled(prev => !prev);
    
    // Animate the toggle button when clicked
    const toggleButton = document.querySelector('.wobble-toggle');
    if (toggleButton) {
      animate(toggleButton, {
        scale: [1, 1.2, 1],
        duration: 300,
        easing: 'easeInOutQuad'
      });
    }
  };

  return (
    <WobbleContext.Provider value={{ wobbleEnabled, toggleWobble }}>
      {children}
    </WobbleContext.Provider>
  );
};