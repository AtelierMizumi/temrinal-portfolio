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
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [initialCommand]);

  // Handle window resize events with debouncing
  useEffect(() => {
    const handleWindowResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        if (termInstanceRef.current) {
          termInstanceRef.current.handleResize();
        }
      }, 100); // 100ms debounce
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Handle container resize with ResizeObserver
  useEffect(() => {
    if (!terminalRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        if (termInstanceRef.current) {
          termInstanceRef.current.handleResize();
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