"use client";

import React, { useState, useEffect, useRef } from "react";
import { XTerm } from "xterm-for-react";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { commands } from "../utils/commands";

interface TerminalProps {
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({ className }) => {
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  
  // Initialize addons and terminal
  useEffect(() => {
    fitAddonRef.current = new FitAddon();
    
    if (xtermRef.current) {
      const term = xtermRef.current.terminal;
      
      // Configure terminal options
      term.options.cursorBlink = true;
      term.options.cursorStyle = "block";
      term.options.fontFamily = "monospace";
      term.options.fontSize = 14;
      term.options.theme = {
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
      };
      
      // Clear terminal and write welcome message
      term.reset();
      term.writeln("Welcome to the Terminal Portfolio!");
      term.writeln("Type 'help' to see available commands.");
      term.writeln("");
      writePrompt();
    }
    
    // Fit terminal to container
    fitTerminal();
    
    // Listen to window resize events
    window.addEventListener("resize", fitTerminal);
    
    return () => {
      window.removeEventListener("resize", fitTerminal);
    };
  }, []);
  
  // Fit terminal to container size
  const fitTerminal = () => {
    if (fitAddonRef.current && xtermRef.current) {
      setTimeout(() => {
        fitAddonRef.current?.fit();
      }, 0);
    }
  };
  
  // Write prompt to terminal
  const writePrompt = () => {
    if (xtermRef.current) {
      xtermRef.current.terminal.write("\r\n\x1b[1;32mvisitor\x1b[0m@\x1b[1;34mportfolio\x1b[0m:\x1b[1;34m~$\x1b[0m ");
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
            const term = xtermRef.current.terminal;
            term.write('\b \b'); // Clear character
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
            xtermRef.current.terminal.write(data);
          }
        }
        break;
        
      case "\u001b[D": // Left arrow
        if (cursorPosition > 0) {
          setCursorPosition(cursorPosition - 1);
          if (xtermRef.current) {
            xtermRef.current.terminal.write(data);
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
            const term = xtermRef.current.terminal;
            
            // Write the character at cursor position
            term.write(char);
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
      const term = xtermRef.current.terminal;
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
        const term = xtermRef.current.terminal;
        term.write("\r\x1b[2K\x1b[1;32mvisitor\x1b[0m@\x1b[1;34mportfolio\x1b[0m:\x1b[1;34m~$\x1b[0m ");
      }
    } else {
      const historyCommand = commandHistory[newIndex];
      setCurrentCommand(historyCommand);
      setCursorPosition(historyCommand.length);
      
      if (xtermRef.current) {
        const term = xtermRef.current.terminal;
        term.write("\r\x1b[2K\x1b[1;32mvisitor\x1b[0m@\x1b[1;34mportfolio\x1b[0m:\x1b[1;34m~$\x1b[0m " + historyCommand);
      }
    }
  };

  return (
    <div className={`h-full ${className}`}>
      <XTerm
        ref={xtermRef}
        addons={[fitAddonRef.current, new WebLinksAddon()]}
        onData={handleTerminalInput}
        className="h-full"
      />
    </div>
  );
};

export default Terminal;
