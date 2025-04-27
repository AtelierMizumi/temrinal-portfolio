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

// Matrix effect function for the cmatrix command
export const runMatrixEffect = (terminal: Terminal) => {
  // Clear terminal before starting effect
  terminal.clear();
  
  const cols = terminal.cols;
  const rows = terminal.rows;
  
  // Characters for the matrix effect
  const chars = '01'.split('');
  
  // Create columns with different drop speeds and starting positions
  const columns = [...Array(cols)].map(() => ({
    pos: Math.floor(Math.random() * rows * 2) - rows, // Random starting position
    speed: Math.random() * 0.5 + 0.5, // Random speed
    length: Math.floor(Math.random() * rows/3) + 5, // Random stream length
    char: () => chars[Math.floor(Math.random() * chars.length)],
  }));
  
  // Track if effect is still running
  let isRunning = true;
  
  // Animation loop
  const loop = () => {
    if (!isRunning) return;
    
    // Clear the terminal (optional, depends on desired effect)
    // terminal.clear();
    
    // Build the frame
    for (let i = 0; i < cols; i++) {
      const column = columns[i];
      
      // Update column position
      column.pos += column.speed;
      
      // Draw the characters in the column
      for (let j = 0; j < column.length; j++) {
        const row = Math.floor(column.pos) - j;
        
        if (row >= 0 && row < rows) {
          const brightness = j === 0 ? 1 : (column.length - j) / column.length;
          
          // Position cursor
          terminal.write(`\x1b[${row + 1};${i + 1}H`);
          
          // Different colors for different positions in the stream
          if (j === 0) {
            terminal.write(`\x1b[1;97m${column.char()}\x1b[0m`); // Bright head
          } else if (j < 3) {
            terminal.write(`\x1b[1;32m${column.char()}\x1b[0m`); // Bright green
          } else {
            terminal.write(`\x1b[32m${column.char()}\x1b[0m`); // Dark green
          }
        }
      }
      
      // Reset column if it's fully off-screen
      if (column.pos - column.length > rows) {
        column.pos = -Math.floor(Math.random() * 10);
      }
    }
    
    // Schedule next frame
    setTimeout(() => {
      if (isRunning) {
        requestAnimationFrame(loop);
      }
    }, 50); // Adjust speed of matrix effect
  };
  
  // Start the animation loop
  loop();
  
  // Return a cleanup function
  return () => {
    isRunning = false;
  };
};