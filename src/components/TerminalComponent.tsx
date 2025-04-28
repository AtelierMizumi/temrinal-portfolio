'use client';

import React, { useEffect, useRef } from 'react';
import 'xterm/css/xterm.css';
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
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize terminal on mount
  useEffect(() => {
    if (!terminalRef.current) return;

    // Add a small delay to ensure DOM is ready before terminal initialization
    const initTimeout = setTimeout(() => {
      // Create and configure the terminal
      try {
        termInstanceRef.current = createTerminal({
          element: terminalRef.current,
          initialCommand,
        });
      } catch (err) {
        console.error('Failed to initialize terminal:', err);
      }
    }, 50);

    // Clean up on unmount
    return () => {
      clearTimeout(initTimeout);
      if (termInstanceRef.current) {
        termInstanceRef.current.dispose();
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [initialCommand]);

  // Handle resize events
  useEffect(() => {
    if (!terminalRef.current || !termInstanceRef.current) return;

    // Create a ResizeObserver to monitor container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (!termInstanceRef.current) return;
      
      // Clear any pending resize to avoid excessive calls
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Debounce the resize operation
      resizeTimeoutRef.current = setTimeout(() => {
        try {
          if (termInstanceRef.current && termInstanceRef.current.handleResize) {
            termInstanceRef.current.handleResize();
          }
        } catch (err) {
          console.error('Error resizing terminal:', err);
        }
      }, 100); // 100ms debounce
    });
    
    resizeObserver.observe(terminalRef.current);
    
    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`terminal-container h-full w-full ${className}`}
      ref={terminalRef}
    />
  );
};

export default TerminalComponent;