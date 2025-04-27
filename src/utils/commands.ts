import { Terminal } from "xterm";
import { runMatrixEffect } from "./terminal";

// Track active effects for cleanup
let activeMatrixEffect: (() => void) | null = null;

// Function to get system information (mocked data for the fastfetch command)
const getSystemInfo = () => {
  return {
    user: 'thuanc177@cachyos',
    os: 'CachyOS x86_64',
    host: 'Nitro AN515-58',
    kernel: 'Linux 6.14.4-2-cachyos',
    uptime: '3 hours, 8 mins',
    packages: '1979 (pacman)',
    shell: 'fish 4.0.2',
    displays: [
      '1920x1080 @ 100Hz [External]',
      '1920x1080 @ 144Hz [Built-in]'
    ],
    de: 'KDE Plasma 6.3.4',
    wm: 'KWin (Wayland)',
    cpu: 'i5-12500H (16) @ 4.50 GHz',
    gpu: 'NVIDIA RTX 3050 Mobile / Intel Iris Xe',
    memory: '13.79 GiB / 31.05 GiB (44%)',
    locale: 'en_US.UTF-8'
  };
};

// Define commands interface with xterm Terminal type
interface Commands {
  [key: string]: (terminal: Terminal, args?: string[]) => Promise<void>;
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
    terminal.writeln("  cmatrix  - Run matrix effect (Ctrl+C to exit)");
    terminal.writeln("  fastfetch - Display system information");
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
  },
  
  cmatrix: async (terminal: Terminal) => {
    // Clear any existing matrix effect
    if (activeMatrixEffect) {
      activeMatrixEffect();
      activeMatrixEffect = null;
    }
    
    terminal.writeln("Starting Matrix effect... Press any key to exit.");
    
    // Start a new matrix effect
    activeMatrixEffect = runMatrixEffect(terminal);
    
    // Set up exit handler
    const exitHandler = terminal.onKey(() => {
      // Stop matrix effect on any keypress
      if (activeMatrixEffect) {
        activeMatrixEffect();
        activeMatrixEffect = null;
      }
      
      // Remove this handler
      exitHandler.dispose();
      
      // Clear terminal and restore prompt
      terminal.clear();
      terminal.write("Matrix effect terminated.\r\n");
    });
  },

  fastfetch: async (terminal: Terminal) => {
    // Get system information (this would be real data in an actual implementation)
    const info = getSystemInfo();
    
    // Clear the terminal
    terminal.clear();
    
    // Display mock fastfetch output with arch linux style logo
    terminal.writeln("");
    terminal.writeln("\x1b[36m           .-------------------------:\x1b[0m                    \x1b[1;32m" + info.user + "\x1b[0m");
    terminal.writeln("\x1b[36m          .+=========================.\x1b[0m                    \x1b[1;37m-----------------\x1b[0m");
    terminal.writeln("\x1b[36m         :++===++==================-\x1b[0m       \x1b[36m:++-\x1b[0m           \x1b[1;37mOS:\x1b[0m " + info.os);
    terminal.writeln("\x1b[36m        :*++====+++++=============-\x1b[0m        \x1b[36m.==:\x1b[0m           \x1b[1;37mHost:\x1b[0m " + info.host);
    terminal.writeln("\x1b[36m       -*+++=====+***++==========:\x1b[0m                        \x1b[1;37mKernel:\x1b[0m " + info.kernel);
    terminal.writeln("\x1b[36m      =*++++========------------:\x1b[0m                         \x1b[1;37mUptime:\x1b[0m " + info.uptime);
    terminal.writeln("\x1b[36m     =*+++++=====-\x1b[0m                     \x1b[36m...\x1b[0m                \x1b[1;37mPackages:\x1b[0m " + info.packages);
    terminal.writeln("\x1b[36m   .+*+++++=-===:\x1b[0m                    \x1b[36m.=+++=:\x1b[0m              \x1b[1;37mShell:\x1b[0m " + info.shell);
    terminal.writeln("\x1b[36m  :++++=====-==:\x1b[0m                     \x1b[36m-*****+\x1b[0m              \x1b[1;37mDisplay 1:\x1b[0m " + info.displays[0]);
    terminal.writeln("\x1b[36m :++========-=.\x1b[0m                      \x1b[36m.=+**+.\x1b[0m              \x1b[1;37mDisplay 2:\x1b[0m " + info.displays[1]);
    terminal.writeln("\x1b[36m.+===========-.\x1b[0m                          \x1b[36m.\x1b[0m                 \x1b[1;37mDE:\x1b[0m " + info.de);
    terminal.writeln("\x1b[36m :+++++++====-\x1b[0m                                \x1b[36m.--==-.     \x1b[0m \x1b[1;37mWM:\x1b[0m " + info.wm);
    terminal.writeln("\x1b[36m  :++==========.\x1b[0m                             \x1b[36m:+++++++:\x1b[0m    \x1b[1;37mCPU:\x1b[0m " + info.cpu);
    terminal.writeln("\x1b[36m   .-===========.\x1b[0m                            \x1b[36m=*****+*+\x1b[0m    \x1b[1;37mGPU:\x1b[0m " + info.gpu);
    terminal.writeln("\x1b[36m    .-===========:\x1b[0m                           \x1b[36m.+*****+:\x1b[0m    \x1b[1;37mMemory:\x1b[0m " + info.memory);
    terminal.writeln("\x1b[36m      -=======++++:::::::::::::::::::::::::-:  .---:\x1b[0m      \x1b[1;37mLocale:\x1b[0m " + info.locale);
    terminal.writeln("");
    terminal.writeln("");
  },
};