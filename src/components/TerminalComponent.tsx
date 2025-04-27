'use client';

import React, { useEffect, useRef } from 'react';
import { createTerminal } from '@/utils/terminal';

interface TerminalComponentProps {
  initialCommand?: string;
  className?: string;
}

const TerminalComponent: React.FC<TerminalComponentProps> = ({
  initialCommand = '',
  className = '',
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstanceRef = useRef<ReturnType<typeof createTerminal> | null>(null);

  // Initialize terminal on mount
  useEffect(() => {
    if (!terminalRef.current) return;

    // Create and configure the terminal
    termInstanceRef.current = createTerminal({
      element: terminalRef.current,
      initialCommand,
    });

    // Clean up on unmount
    return () => {
      if (termInstanceRef.current) {
        termInstanceRef.current.dispose();
      }
    };
  }, [initialCommand]);

  // Handle window resize events
  useEffect(() => {
    const handleWindowResize = () => {
      if (termInstanceRef.current) {
        termInstanceRef.current.handleResize();
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return (
    <div 
      className={`terminal-container h-full ${className}`}
      ref={terminalRef}
    />
  );
};

export default TerminalComponent;