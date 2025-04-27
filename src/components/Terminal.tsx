"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { commands } from '@/utils/commands';

interface TerminalProps {
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({ className = '' }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<any>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [terminalReady, setTerminalReady] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isResizingRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (!terminalRef.current) return;
    
    // Initialize terminal with the container element
    const terminal = new XTerminal({
      fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      theme: {
        background: '#1a1a1a',
        foreground: '#f0f0f0',
        black: '#000000',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#e5c07b',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#d0d0d0',
      },
      allowTransparency: true,
      scrollback: 1000,
      convertEol: true, // Important for proper line breaks
      disableStdin: false,
    });
    
    // Add fit addon for resizing
    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    
    // Open terminal in the provided element
    terminal.open(terminalRef.current);
    
    // Store terminal instance for later use
    terminalInstanceRef.current = {
      terminal,
      dispose: () => {
        try {
          terminal.dispose();
        } catch (e) {
          console.error('Error disposing terminal:', e);
        }
      }
    };

    // Allow terminal to fully initialize before writing to it
    setTimeout(() => {
      // Set some initial text
      terminal.write('\x1b[1;32m$ Welcome to Terminal Portfolio!\x1b[0m\r\n');
      terminal.write('\x1b[1;37mType "help" to see available commands.\x1b[0m\r\n\r\n');
      terminal.write('$ ');
      
      // Set terminal ready state
      setTerminalReady(true);
      
      // Initial fit to ensure proper sizing
      fitAddon.fit();
    }, 100);
    
    // Handle window resize with debouncing
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        if (fitAddon && terminalRef.current?.offsetParent) {
          try {
            fitAddon.fit();
            terminal.scrollToBottom();
          } catch (e) {
            console.error('Error fitting terminal:', e);
          }
        }
      }, 150); // Slightly longer debounce to ensure window has settled
    };

    window.addEventListener('resize', handleResize);
    
    // Set up command handling
    let currentLine = '';
    let commandHistory: string[] = [];
    let historyIndex = 0;
    
    terminal.onKey(({ key, domEvent }) => {
      const charCode = domEvent.keyCode;
      
      // Handle Enter key
      if (charCode === 13) {
        terminal.write('\r\n');
        
        // Process command
        if (currentLine.trim()) {
          // Add to history
          commandHistory.push(currentLine);
          historyIndex = commandHistory.length;
          
          // Process command
          processCommand(currentLine, terminal);
        } else {
          terminal.write('$ ');
        }
        
        // Reset current line
        
        currentLine = '';
        
        // Ensure terminal scrolls to the bottom after command execution
        setTimeout(() => terminal.scrollToBottom(), 10);
      } 
      // Handle Backspace
      else if (charCode === 8) {
        if (currentLine.length > 0) {
          currentLine = currentLine.substring(0, currentLine.length - 1);
          terminal.write('\b \b'); // Move back, clear character, move back again
        }
      }
      // Handle Up Arrow - command history
      else if (charCode === 38) {
        if (historyIndex > 0) {
          historyIndex--;
          // Clear current line
          while (currentLine.length > 0) {
            terminal.write('\b \b');
            currentLine = currentLine.substring(0, currentLine.length - 1);
          }
          // Write history item
          currentLine = commandHistory[historyIndex];
          terminal.write(currentLine);
        }
      }
      // Handle Down Arrow - command history
      else if (charCode === 40) {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          // Clear current line
          while (currentLine.length > 0) {
            terminal.write('\b \b');
            currentLine = currentLine.substring(0, currentLine.length - 1);
          }
          // Write history item
          currentLine = commandHistory[historyIndex];
          terminal.write(currentLine);
        } else if (historyIndex === commandHistory.length - 1) {
          historyIndex++;
          // Clear current line
          while (currentLine.length > 0) {
            terminal.write('\b \b');
            currentLine = currentLine.substring(0, currentLine.length - 1);
          }
          currentLine = '';
        }
      }
      // Handle normal character input
      else if (charCode >= 32) {
        currentLine += key;
        terminal.write(key);
      }
    });
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
      }
    };
  }, []);
  
  // Custom command handler implementation
  const processCommand = async (command: string, terminal: XTerminal) => {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    if (cmd in commands) {
      await commands[cmd](terminal, args);
    } else if (cmd === '') {
      // Do nothing for empty command
    } else {
      terminal.writeln(`\r\nCommand not found: ${cmd}`);
      terminal.writeln('Type "help" to see available commands.');
    }
    
    // Always show prompt after command execution
    terminal.write('\r\n$ ');
  };

  // Handle ResizeObserver with better debouncing
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (isResizingRef.current) return; // Don't respond during active resize
      
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        if (fitAddonRef.current && terminalRef.current?.offsetParent) {
          try {
            fitAddonRef.current.fit();
            if (terminalInstanceRef.current?.terminal) {
              terminalInstanceRef.current.terminal.scrollToBottom();
            }
          } catch (e) {
            console.error('Error during resize:', e);
          }
        }
      }, 150); // Slightly longer delay to let resize settle
    });
    
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [terminalReady]);
  
  // Add listeners for window resize events
  useEffect(() => {
    const handleMouseDown = () => {
      isResizingRef.current = true;
    };
    
    const handleMouseUp = () => {
      isResizingRef.current = false;
      
      // After mouse up, fit the terminal once more
      setTimeout(() => {
        if (fitAddonRef.current && terminalRef.current?.offsetParent) {
          try {
            fitAddonRef.current.fit();
            if (terminalInstanceRef.current?.terminal) {
              terminalInstanceRef.current.terminal.scrollToBottom();
            }
          } catch (e) {
            console.error('Error after resize:', e);
          }
        }
      }, 200);
    };
    
    // Get any resize handles from parent containers
    const resizeHandles = document.querySelectorAll('.absolute.bottom-0.right-0.w-4.h-4.cursor-se-resize');
    
    resizeHandles.forEach(handle => {
      handle.addEventListener('mousedown', handleMouseDown);
    });
    
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      resizeHandles.forEach(handle => {
        handle.removeEventListener('mousedown', handleMouseDown);
      });
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  // Listen for terminal-resize-end events from WindowManager
  useEffect(() => {
    const handleTerminalResizeEnd = (e: Event) => {
      const customEvent = e as CustomEvent;
      
      // Set short timeout to let the window fully settle
      setTimeout(() => {
        if (fitAddonRef.current && terminalRef.current?.offsetParent) {
          try {
            // Force a complete terminal resize and refit
            fitAddonRef.current.fit();
            
            // If we have a terminal instance, scroll to make sure content is visible
            if (terminalInstanceRef.current?.terminal) {
              terminalInstanceRef.current.terminal.scrollToBottom();
            }
          } catch (e) {
            console.error('Error during terminal resize:', e);
          }
        }
      }, 100);
    };
    
    // Listen for the custom event from WindowManager
    document.addEventListener('terminal-resize-end', handleTerminalResizeEnd);
    
    return () => {
      document.removeEventListener('terminal-resize-end', handleTerminalResizeEnd);
    };
  }, []);
  
  return (
    <div 
      ref={terminalRef} 
      className={`terminal-wrapper h-full w-full ${className}`}
      style={{ overflow: 'hidden', position: 'relative' }}
    />
  );
};

export default Terminal;
