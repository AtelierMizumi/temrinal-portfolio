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
 * Creates and configures an xterm.js terminal with necessary add-ons
 */
export const createTerminal = ({ 
  element = null, 
  initialCommand = '', 
  cols = 80, 
  rows = 24 
}: TerminalOptions = {}) => {
  // Create terminal instance
  const terminal = new Terminal({
    cursorBlink: true,
    cursorStyle: 'block',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 14,
    theme: {
      background: 'rgba(35, 38, 52, 0.8)',
      foreground: '#c6d0f5',
      cursor: '#c6d0f5',
      selectionBackground: 'rgba(126, 128, 134, 0.4)',
    },
    cols,
    rows,
    allowTransparency: true,
  });

  // Initialize add-ons
  const fitAddon = new FitAddon();
  const webLinksAddon = new WebLinksAddon();
  
  terminal.loadAddon(fitAddon);
  terminal.loadAddon(webLinksAddon);

  // Open terminal in the provided element
  if (element) {
    terminal.open(element);
    
    // Allow time for the DOM to update before fitting
    setTimeout(() => {
      fitAddon.fit();
    }, 0);
  }

  // Write initial command if provided
  if (initialCommand) {
    terminal.writeln(initialCommand);
  }

  // Handle resizing
  const handleResize = () => {
    try {
      if (element?.offsetParent) {
        fitAddon.fit();
      }
    } catch (err) {
      console.error('Error resizing terminal:', err);
    }
  };

  // Setup resize observer to handle container size changes
  if (element) {
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    resizeObserver.observe(element);

    // Clean up function
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

  return {
    terminal,
    fitAddon,
    handleResize,
    dispose: () => terminal.dispose(),
  };
};