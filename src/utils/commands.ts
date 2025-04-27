import { Terminal } from "xterm";

// Define commands interface with xterm Terminal type
interface Commands {
  [key: string]: (terminal: Terminal, args: string[]) => Promise<void>;
}

export const commands: Commands = {
  help: async (terminal: Terminal) => {
    terminal.writeln("Available commands:");
    terminal.writeln("  help     - Show this help message");
    terminal.writeln("  clear    - Clear the terminal");
    terminal.writeln("  echo     - Print text to the terminal");
    terminal.writeln("  ls       - List files and directories");
    terminal.writeln("  cat      - Show content of a file");
    terminal.writeln("  about    - Show information about me");
    terminal.writeln("  projects - List my projects");
    terminal.writeln("  skills   - List my skills");
    terminal.writeln("  contact  - Show my contact information");
  },
  clear: async (terminal: Terminal) => {
    terminal.clear();
  },
  echo: async (terminal: Terminal, args: string[]) => {
    terminal.writeln(args.join(" "));
  },
  ls: async (terminal: Terminal, args: string[]) => {
    terminal.writeln("\x1b[1;34mprojects\x1b[0m  \x1b[1;34mdocs\x1b[0m  \x1b[1;34mskills\x1b[0m");
    terminal.writeln("\x1b[1;32mabout.txt\x1b[0m  \x1b[1;32mcontact.txt\x1b[0m  \x1b[1;32mresume.pdf\x1b[0m");
  },
  cat: async (terminal: Terminal, args: string[]) => {
    if (args.length === 0) {
      terminal.writeln("Usage: cat <filename>");
      return;
    }

    const filename = args[0].toLowerCase();
    switch (filename) {
      case "about.txt":
        terminal.writeln("Hi there! I'm a web developer with a passion for creating interactive");
        terminal.writeln("and responsive web applications. I specialize in React, TypeScript, and");
        terminal.writeln("Next.js. This terminal portfolio is a showcase of my skills.");
        break;
      case "contact.txt":
        terminal.writeln("Email: example@example.com");
        terminal.writeln("GitHub: github.com/username");
        terminal.writeln("LinkedIn: linkedin.com/in/username");
        terminal.writeln("Twitter: @username");
        break;
      default:
        terminal.writeln(`File not found: ${args[0]}`);
    }
  },
  about: async (terminal: Terminal) => {
    terminal.writeln("Hi there! I'm a web developer with a passion for creating interactive");
    terminal.writeln("and responsive web applications. I specialize in React, TypeScript, and");
    terminal.writeln("Next.js. This terminal portfolio is a showcase of my skills.");
  },
  projects: async (terminal: Terminal) => {
    terminal.writeln("\x1b[1;36mProjects:\x1b[0m");
    terminal.writeln("\x1b[1;33m1. Terminal Portfolio\x1b[0m");
    terminal.writeln("   A command-line interface portfolio website built with Next.js and xterm.js");
    terminal.writeln("\x1b[1;33m2. Project Two\x1b[0m");
    terminal.writeln("   Description of project two goes here");
    terminal.writeln("\x1b[1;33m3. Project Three\x1b[0m");
    terminal.writeln("   Description of project three goes here");
  },
  skills: async (terminal: Terminal) => {
    terminal.writeln("\x1b[1;36mSkills:\x1b[0m");
    terminal.writeln("\x1b[1;33mFrontend:\x1b[0m React, TypeScript, Next.js, HTML, CSS, TailwindCSS");
    terminal.writeln("\x1b[1;33mBackend:\x1b[0m Node.js, Express, MongoDB, PostgreSQL");
    terminal.writeln("\x1b[1;33mTools:\x1b[0m Git, Docker, Webpack, Jest");
  },
  contact: async (terminal: Terminal) => {
    terminal.writeln("\x1b[1;36mContact Information:\x1b[0m");
    terminal.writeln("Email: example@example.com");
    terminal.writeln("GitHub: github.com/username");
    terminal.writeln("LinkedIn: linkedin.com/in/username");
    terminal.writeln("Twitter: @username");
  }
};