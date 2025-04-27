"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { commands } from "../utils/commands";
import "xterm/css/xterm.css";

interface TerminalProps {
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({ className }) => {
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  
  // Initialize terminal
  useEffect(() => {
    // Initialize addons
    fitAddonRef.current = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    
    // Create terminal instance
    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: "block",
      fontFamily: "monospace",
      fontSize: 14,
      theme: {
        background: "#1a1b26",
        foreground: "#c0caf5",
        cursor: "#c0caf5",
        selectionBackground: "#364a82",
        black: "#15161e",
        blue: "#7aa2f7",
        cyan: "#7dcfff",
        green: "#9ece6a",
        magenta: "#bb9af7",
        red: "#f7768e",
        white: "#a9b1d6",
        yellow: "#e0af68"
      }
    });
    
    // Save terminal reference
    xtermRef.current = term;
    
    // Load addons
    term.loadAddon(fitAddonRef.current);
    term.loadAddon(webLinksAddon);
    
    // Open terminal in the DOM
    if (terminalRef.current) {
      term.open(terminalRef.current);
      fitAddonRef.current.fit();
      
      // Write welcome message
      term.writeln("Welcome to the Terminal Portfolio!");
      term.writeln("Type 'help' to see available commands.");
      term.writeln("");
      writePrompt();
      
      // Listen to terminal data events (keystrokes)
      term.onData(handleTerminalInput);
      
      // Listen for window resize events
      window.addEventListener('resize', fitTerminal);
    }
    
    return () => {
      // Cleanup
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
      window.removeEventListener('resize', fitTerminal);
    };
  }, []);
  
  // Fit terminal to container size
  const fitTerminal = () => {
    if (fitAddonRef.current) {
      try {
        fitAddonRef.current.fit();
      } catch (err) {
        console.error("Failed to fit terminal:", err);
      }
    }
  };
  
  // Write prompt to terminal
  const writePrompt = () => {
    if (xtermRef.current) {
      xtermRef.current.write("\r\n\x1b[1;32mvisitor\x1b[0m@\x1b[1;34mportfolio\x1b[0m:\x1b[1;34m~$\x1b[0m ");
    }
  };
  
  // Handle input from terminal
  const handleTerminalInput = (data: string) => {
    if (isProcessingCommand) return;

    const char = data.toString();
    
    // Handle special keys
    switch (char) {
      case "\r": // Enter key
        executeCommand();
        break;
        
      case "\u007f": // Backspace key
        if (cursorPosition > 0) {
          const newCommand = currentCommand.slice(0, cursorPosition - 1) + currentCommand.slice(cursorPosition);
          setCurrentCommand(newCommand);
          setCursorPosition(cursorPosition - 1);
          
          // Update terminal display
          if (xtermRef.current) {
            xtermRef.current.write('\b \b'); // Clear character
          }
        }
        break;
        
      case "\u001b[A": // Up arrow
        navigateHistory(-1);
        break;
        
      case "\u001b[B": // Down arrow
        navigateHistory(1);
        break;
        
      case "\u001b[C": // Right arrow
        if (cursorPosition < currentCommand.length) {
          setCursorPosition(cursorPosition + 1);
          if (xtermRef.current) {
            xtermRef.current.write(data);
          }
        }
        break;
        
      case "\u001b[D": // Left arrow
        if (cursorPosition > 0) {
          setCursorPosition(cursorPosition - 1);
          if (xtermRef.current) {
            xtermRef.current.write(data);
          }
        }
        break;
        
      default:
        // Regular character input
        if (char >= " " && char <= "~") { // Printable ASCII characters
          const newCommand = 
            currentCommand.slice(0, cursorPosition) + 
            char + 
            currentCommand.slice(cursorPosition);
          
          setCurrentCommand(newCommand);
          setCursorPosition(cursorPosition + 1);
          
          if (xtermRef.current) {
            xtermRef.current.write(char);
          }
        }
        break;
    }
  };
  
  // Execute command
  const executeCommand = async () => {
    if (!currentCommand.trim()) {
      writePrompt();
      return;
    }
    
    setIsProcessingCommand(true);
    
    if (xtermRef.current) {
      const term = xtermRef.current;
      term.write("\r\n");
      
      const trimmedCommand = currentCommand.trim();
      const [cmd, ...args] = trimmedCommand.split(" ");
      
      // Update command history
      setCommandHistory((prev) => [trimmedCommand, ...prev].slice(0, 50));
      setHistoryIndex(-1);
      
      // Execute command
      try {
        const commandFn = commands[cmd.toLowerCase()];
        if (commandFn) {
          await commandFn(term, args);
        } else {
          term.writeln(`Command not found: ${cmd}`);
        }
      } catch (error) {
        console.error("Command execution error:", error);
        term.writeln(`Error executing command: ${error}`);
      }
      
      // Reset and write new prompt
      setCurrentCommand("");
      setCursorPosition(0);
      writePrompt();
    }
    
    setIsProcessingCommand(false);
  };
  
  // Navigate command history
  const navigateHistory = (direction: number) => {
    if (commandHistory.length === 0) return;
    
    const newIndex = Math.max(
      -1,
      Math.min(historyIndex + direction, commandHistory.length - 1)
    );
    setHistoryIndex(newIndex);
    
    if (newIndex === -1) {
      setCurrentCommand("");
      setCursorPosition(0);
      
      if (xtermRef.current) {
        xtermRef.current.write("\r\x1b[2K\x1b[1;32mvisitor\x1b[0m@\x1b[1;34mportfolio\x1b[0m:\x1b[1;34m~$\x1b[0m ");
      }
    } else {
      const historyCommand = commandHistory[newIndex];
      setCurrentCommand(historyCommand);
      setCursorPosition(historyCommand.length);
      
      if (xtermRef.current) {
        xtermRef.current.write("\r\x1b[2K\x1b[1;32mvisitor\x1b[0m@\x1b[1;34mportfolio\x1b[0m:\x1b[1;34m~$\x1b[0m " + historyCommand);
      }
    }
  };

  return (
    <div className={`h-full ${className}`}>
      <div ref={terminalRef} className="h-full" />
    </div>
  );
};

export default Terminal;
