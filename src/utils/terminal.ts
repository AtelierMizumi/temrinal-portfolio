import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

interface TerminalOptions {
  element?: HTMLElement | null;
  initialCommand?: string;
  cols?: number;
  rows?: number;
}

/**
 * Creates and initializes an xterm terminal instance
 */
export const createTerminal = ({ 
  element = null, 
  initialCommand = '', 
  cols = 80, 
  rows = 24 
}: TerminalOptions = {}) => {
  // Create the terminal instance
  const terminal = new Terminal({
    fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
    fontSize: 14,
    lineHeight: 1.4,
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
      brightBlack: '#5c6370',
      brightRed: '#e06c75',
      brightGreen: '#98c379',
      brightYellow: '#e5c07b',
      brightBlue: '#61afef',
      brightMagenta: '#c678dd',
      brightCyan: '#56b6c2',
      brightWhite: '#ffffff',
    },
    allowTransparency: true,
    convertEol: true,
    scrollback: 1000,
    cols,
    rows
  });
  
  // Add fit addon for resizing
  const fitAddon = new FitAddon();
  const webLinksAddon = new WebLinksAddon();
  
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(webLinksAddon);
  
  // Open terminal in the provided element
  if (element) {
    terminal.open(element);
    
    // Allow time for the DOM to update before fitting
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.error('Error fitting terminal:', e);
      }
    }, 50);
  }
  
  // Write initial command if provided
  if (initialCommand) {
    terminal.writeln(initialCommand);
  }
  
  // Handle resize
  const handleResize = () => {
    try {
      if (element?.offsetParent) {
        fitAddon.fit();
        // Ensure cursor is at the bottom after resize
        terminal.scrollToBottom();
      }
    } catch (error) {
      console.error('Error resizing terminal:', error);
    }
  };
  
  // Setup resize observer to handle container size changes
  if (element) {
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    resizeObserver.observe(element);
    
    // Clean up function for observer
    const dispose = () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
    
    return {
      terminal,
      fitAddon,
      handleResize,
      dispose,
    };
  }
  
  // Dispose function for cleanup
  const dispose = () => {
    try {
      terminal.dispose();
    } catch (error) {
      console.error('Error disposing terminal:', error);
    }
  };
  
  return { terminal, fitAddon, handleResize, dispose };
};

// Matrix character generation
export function runMatrixEffect(terminal: Terminal): () => void {
  // Get terminal dimensions
  const cols = terminal.cols;
  const rows = terminal.rows;
  
  // Clear terminal before starting
  terminal.clear();
  
  // Create matrix data structure
  const matrix: number[] = new Array(cols).fill(0);
  const characters: string[][] = Array.from({ length: cols }, () => 
    Array.from({ length: rows }, () => ' '));
  const brightness: number[][] = Array.from({ length: cols }, () => 
    Array.from({ length: rows }, () => 0));
  
  // Animation frame ID for cleanup
  let animationFrameId: number;
  
  // Random characters for matrix effect
  const getRandomChar = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
    return chars.charAt(Math.floor(Math.random() * chars.length));
  };
  
  // Update function for animation
  const update = () => {
    // For each column
    for (let i = 0; i < cols; i++) {
      // Random chance to create a new drop
      if (Math.random() < 0.02 && matrix[i] === 0) {
        matrix[i] = 1;
      }
      
      // If there's an active drop in this column
      if (matrix[i] > 0) {
        // Fade previous characters
        for (let j = 0; j < rows; j++) {
          if (brightness[i][j] > 0) {
            brightness[i][j] -= 0.05; // Fade effect
            if (brightness[i][j] <= 0) {
              brightness[i][j] = 0;
              characters[i][j] = ' ';
            }
          }
        }
        
        // Set a new character at the drop position
        const y = matrix[i] - 1;
        if (y < rows) {
          characters[i][y] = getRandomChar();
          brightness[i][y] = 1; // Full brightness for new character
        }
        
        // Move the drop down
        matrix[i]++;
        
        // If the drop goes off screen, reset it
        if (matrix[i] > rows + Math.random() * 15) {
          matrix[i] = 0;
        }
      }
    }
    
    // Render the matrix
    render();
    
    // Continue animation
    animationFrameId = requestAnimationFrame(update);
  };
  
  // Render function
  const render = () => {
    terminal.write("\x1b[H"); // Move cursor to top-left
    
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        if (characters[i][j] !== ' ') {
          // Calculate color based on brightness
          const b = brightness[i][j];
          if (b > 0.8) {
            // Bright white for newest characters
            terminal.write(`\x1b[1;97m${characters[i][j]}\x1b[0m`);
          } else if (b > 0.5) {
            // Green for fading characters
            terminal.write(`\x1b[1;32m${characters[i][j]}\x1b[0m`);
          } else if (b > 0.3) {
            // Darker green for older characters
            terminal.write(`\x1b[0;32m${characters[i][j]}\x1b[0m`);
          } else {
            // Darkest green for oldest characters
            terminal.write(`\x1b[2;32m${characters[i][j]}\x1b[0m`);
          }
        } else {
          terminal.write(' ');
        }
      }
      if (j < rows - 1) {
        terminal.write('\r\n');
      }
    }
  };
  
  // Start animation
  animationFrameId = requestAnimationFrame(update);
  
  // Return cleanup function
  return () => {
    // Cancel animation
    cancelAnimationFrame(animationFrameId);
    // Clear terminal completely
    terminal.write("\x1b[H\x1b[2J"); // Clear entire screen and move cursor to home
    terminal.clear();
  };
}