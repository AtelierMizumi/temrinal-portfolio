"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useTheme } from "./theme-provider";

interface TerminalProps {
  className?: string;
  onThemeChange?: (theme: "light" | "dark") => void;
}

const Terminal: React.FC<TerminalProps> = ({ className, onThemeChange }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { setTheme } = useTheme();

  // Fish shell prompt
  const prompt = "\r\n\x1b[38;5;39m~\x1b[0m \x1b[38;5;141m>\x1b[0m ";

  // Portfolio content
  const portfolioData = {
    about: `# About Me

I'm a software developer with a passion for building useful and beautiful applications.
I specialize in web development using modern technologies like React, Next.js, and TypeScript.

I love learning new technologies and solving challenging problems.
When I'm not coding, I enjoy hiking, reading, and playing the guitar.`,

    skills: {
      languages: ["JavaScript", "TypeScript", "HTML", "CSS", "Python"],
      frameworks: ["React", "Next.js", "Node.js", "Express", "TailwindCSS"],
      tools: ["Git", "Docker", "AWS", "Figma", "PostgreSQL", "MongoDB"],
      softSkills: ["Communication", "Problem Solving", "Teamwork", "Adaptability"]
    },

    projects: [
      {
        name: "Project One",
        description: "A web application built with React and Node.js",
        technologies: ["React", "Node.js", "MongoDB"],
        github: "github.com/yourusername/project-one"
      },
      {
        name: "Project Two",
        description: "A mobile app built with React Native",
        technologies: ["React Native", "Redux", "Firebase"],
        github: "github.com/yourusername/project-two"
      },
      {
        name: "Project Three",
        description: "A CLI tool built with Python",
        technologies: ["Python", "Click", "AWS"],
        github: "github.com/yourusername/project-three"
      }
    ],

    contact: {
      email: "your.email@example.com",
      linkedin: "linkedin.com/in/yourusername",
      github: "github.com/yourusername",
      twitter: "@yourusername"
    }
  };

  // Neofetch-style ASCII art - simplified portfolio logo
  const neofetchArt = [
    "\x1b[38;5;141m        .-/+oossssoo+/-.        \x1b[0m",
    "\x1b[38;5;141m    `:+ssssssssssssssssss+:\`    \x1b[0m",
    "\x1b[38;5;141m  -+ssssssssssssssssssyyssss+-  \x1b[0m",
    "\x1b[38;5;141m.ossssssssssssssssss\x1b[38;5;97mdMMMNy\x1b[38;5;141msssso.\x1b[0m",
    "\x1b[38;5;141m+sssssssssss\x1b[38;5;97mhdmmNNmmyNMMMMh\x1b[38;5;141mssss+\x1b[0m",
    "\x1b[38;5;141m++sssssssss\x1b[38;5;97mhm\x1b[38;5;141myd\x1b[38;5;97mMMMMMMMNddy\x1b[38;5;141mssss++\x1b[0m",
    "\x1b[38;5;141m.+ssssssss\x1b[38;5;97mhdm\x1b[38;5;141mdds\x1b[38;5;97myNMMMMMMMMMM\x1b[38;5;141mssss+.\x1b[0m",
    "\x1b[38;5;141m -osssssss\x1b[38;5;97mhdmNNd\x1b[38;5;141msssshNMMMMMMMMM\x1b[38;5;141mssso-\x1b[0m",
    "\x1b[38;5;141m  :osssssss\x1b[38;5;97mhmMMNy\x1b[38;5;141mssos\x1b[38;5;97mhNMMMMMMMM\x1b[38;5;141my+:\x1b[0m",
    "\x1b[38;5;141m    -+sss\x1b[38;5;97mhdmmMMMNddym\x1b[38;5;141msso\x1b[38;5;97myNMMMMMMs\x1b[38;5;141m-\x1b[0m",
    "\x1b[38;5;141m     `/o\x1b[38;5;97mhdmMMMMMMMMMMMMm\x1b[38;5;141msssssomMd/`\x1b[0m",
    "\x1b[38;5;141m       `/\x1b[38;5;97mhmMMMMMMMMMMMMd\x1b[38;5;141mssshNmo`\x1b[0m",
    "\x1b[38;5;141m         `.\x1b[38;5;97mhmMMMMMMMMMMd\x1b[38;5;141mssmMh/`\x1b[0m",
    "\x1b[38;5;141m           `\x1b[38;5;97msNMMMMMMMMMM\x1b[38;5;141mmdh/`\x1b[0m",
  ];

  // Display time - for topbar
  const getTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Available background options
  const backgrounds = {
    "gradient-blue": "bg-gradient-to-br from-base to-mantle",
    "gradient-purple": "bg-gradient-to-br from-mauve/30 to-base",
    "gradient-green": "bg-gradient-to-br from-green/30 to-base",
    "solid-dark": "bg-base",
    "catppuccin": "bg-[url('/catppuccin-bg.jpg')]",
    "matrix": "bg-[url('/matrix.gif')]",
    "mountains": "bg-[url('/mountains.jpg')]"
  };

  // Typing animation function
  const typeText = (term: XTerminal, text: string, delay = 20): Promise<void> => {
    return new Promise((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          term.write(text.charAt(i));
          i++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });
  };

  // Format output with better colors and alignment
  const formatOutput = (text: string): string => {
    // Add proper line breaks and indentation
    return text.replace(/\n/g, "\r\n");
  };

  // Colorize and format text for better output
  const formatAbout = (): string => {
    return `\x1b[1;38;5;141m# About Me\x1b[0m\r\n\r\n\x1b[38;5;254mI'm a software developer with a passion for building useful and beautiful applications.
I specialize in web development using modern technologies like \x1b[38;5;110mReact\x1b[38;5;254m, \x1b[38;5;110mNext.js\x1b[38;5;254m, and \x1b[38;5;110mTypeScript\x1b[38;5;254m.\r\n
I love learning new technologies and solving challenging problems.
When I'm not coding, I enjoy hiking, reading, and playing the guitar.\x1b[0m`;
  };

  const formatSkills = (): string => {
    const skills = portfolioData.skills;
    let output = "\x1b[1;38;5;141mMy Skills\x1b[0m\r\n\r\n";

    output += "\x1b[1;38;5;216mLanguages:\x1b[0m\r\n";
    output += skills.languages.map(lang => `  \x1b[38;5;254m- \x1b[38;5;110m${lang}\x1b[0m`).join("\r\n");

    output += "\r\n\r\n\x1b[1;38;5;216mFrameworks & Libraries:\x1b[0m\r\n";
    output += skills.frameworks.map(framework => `  \x1b[38;5;254m- \x1b[38;5;110m${framework}\x1b[0m`).join("\r\n");

    output += "\r\n\r\n\x1b[1;38;5;216mTools & Technologies:\x1b[0m\r\n";
    output += skills.tools.map(tool => `  \x1b[38;5;254m- \x1b[38;5;110m${tool}\x1b[0m`).join("\r\n");

    output += "\r\n\r\n\x1b[1;38;5;216mSoft Skills:\x1b[0m\r\n";
    output += skills.softSkills.map(skill => `  \x1b[38;5;254m- \x1b[38;5;110m${skill}\x1b[0m`).join("\r\n");

    return output;
  };

  const formatProjects = (): string => {
    const projects = portfolioData.projects;
    let output = "\x1b[1;38;5;141mMy Projects\x1b[0m\r\n\r\n";

    projects.forEach((project, index) => {
      output += `\x1b[1;38;5;216m${index + 1}. ${project.name}\x1b[0m\r\n`;
      output += `   \x1b[38;5;254m${project.description}\x1b[0m\r\n`;
      output += `   \x1b[38;5;110mTechnologies:\x1b[0m `;
      output += project.technologies.map(tech => `\x1b[38;5;147m${tech}\x1b[0m`).join(", ");
      output += `\r\n   \x1b[38;5;110mGitHub:\x1b[0m \x1b[38;5;147m${project.github}\x1b[0m\r\n\r\n`;
    });

    return output;
  };

  const formatContact = (): string => {
    const contact = portfolioData.contact;
    let output = "\x1b[1;38;5;141mContact Information\x1b[0m\r\n\r\n";

    output += `\x1b[38;5;110mEmail:\x1b[0m \x1b[38;5;254m${contact.email}\x1b[0m\r\n`;
    output += `\x1b[38;5;110mLinkedIn:\x1b[0m \x1b[38;5;254m${contact.linkedin}\x1b[0m\r\n`;
    output += `\x1b[38;5;110mGitHub:\x1b[0m \x1b[38;5;254m${contact.github}\x1b[0m\r\n`;
    output += `\x1b[38;5;110mTwitter:\x1b[0m \x1b[38;5;254m${contact.twitter}\x1b[0m`;

    return output;
  };

  // Available commands
  const commands: Record<string, { execute: (args: string[]) => string; description: string }> = {
    help: {
      execute: () => {
        return Object.keys(commands)
          .map(cmd => `\x1b[38;5;110m${cmd.padEnd(15)}\x1b[0m - \x1b[38;5;254m${commands[cmd].description}\x1b[0m`)
          .join("\r\n");
      },
      description: "Show available commands"
    },
    clear: {
      execute: () => {
        xtermRef.current?.clear();
        return "";
      },
      description: "Clear the terminal screen"
    },
    about: {
      execute: () => {
        return formatAbout();
      },
      description: "Display information about me"
    },
    skills: {
      execute: () => {
        return formatSkills();
      },
      description: "Display my technical skills"
    },
    projects: {
      execute: () => {
        return formatProjects();
      },
      description: "Display my projects"
    },
    contact: {
      execute: () => {
        return formatContact();
      },
      description: "Show my contact information"
    },
    neofetch: {
      execute: () => {
        // Return the neofetch-style display
        return displayNeofetch();
      },
      description: "Display system information and profile summary"
    },
    ls: {
      execute: () => {
        return "\x1b[38;5;110mabout\x1b[0m  \x1b[38;5;110mprojects\x1b[0m  \x1b[38;5;110mskills\x1b[0m  \x1b[38;5;110mcontact\x1b[0m  \x1b[38;5;110mresume.pdf\x1b[0m";
      },
      description: "List available portfolio sections"
    },
    cd: {
      execute: (args) => {
        if (!args.length) return "You're already at the root directory";

        const section = args[0].replace(/\/$/, "");

        if (["about", "projects", "skills", "contact"].includes(section)) {
          return `Changed to ${section} section. Type '${section}' to view content.`;
        }

        return `cd: ${args[0]}: No such directory`;
      },
      description: "Navigate between portfolio sections"
    },
    cat: {
      execute: (args) => {
        if (!args.length) return "Usage: cat <filename>";

        const filename = args[0];

        if (filename === "about") {
          return formatAbout();
        }
        if (filename === "skills" || filename === "skills.json") {
          return formatSkills();
        }
        if (filename === "projects") {
          return formatProjects();
        }
        if (filename === "contact" || filename === "contact.txt") {
          return formatContact();
        }
        if (filename === "resume.pdf") {
          return "Opening resume.pdf would be implemented in a real portfolio";
        }

        return `cat: ${args[0]}: No such file or directory`;
      },
      description: "Display file contents"
    },
    echo: {
      execute: (args) => {
        return args.join(" ");
      },
      description: "Display a line of text"
    },
    date: {
      execute: () => {
        return new Date().toString();
      },
      description: "Display the current date and time"
    },
    whoami: {
      execute: () => {
        return "visitor@portfolio";
      },
      description: "Display current user"
    },
    fish: {
      execute: () => {
        return "🐟 < glub glub >";
      },
      description: "Just for fun"
    },
    theme: {
      execute: (args) => {
        if (!args.length) return "Usage: theme [light|dark]";

        if (args[0] === "light") {
          if (setTheme) {
            setTheme("light");
            if (onThemeChange) onThemeChange("light");
          }
          return "\x1b[38;5;254mTheme switched to \x1b[38;5;110mlight mode\x1b[0m";
        }

        if (args[0] === "dark") {
          if (setTheme) {
            setTheme("dark");
            if (onThemeChange) onThemeChange("dark");
          }
          return "\x1b[38;5;254mTheme switched to \x1b[38;5;141mdark mode\x1b[0m (default)";
        }

        return `Unknown theme: ${args[0]}. Available themes: light, dark`;
      },
      description: "Change the theme (light/dark)"
    },
    background: {
      execute: (args) => {
        if (!args.length) {
          return `Available backgrounds:\r\n${Object.keys(backgrounds).map(bg => `- ${bg}`).join('\r\n')}\r\n\r\nUsage: background [name]`;
        }

        const bg = args[0];
        if (backgrounds[bg]) {
          // This will be handled by the parent component
          document.dispatchEvent(new CustomEvent('change-background', { detail: bg }));
          return `Background changed to ${bg}`;
        }

        return `Unknown background: ${bg}. Use 'background' to see available options.`;
      },
      description: "Change the desktop background"
    },
    wobble: {
      execute: (args) => {
        if (!args.length) {
          document.dispatchEvent(new CustomEvent('toggle-wobble', { detail: true }));
          return "Window wobble effect has been enabled";
        }

        if (args[0] === "on" || args[0] === "enable") {
          document.dispatchEvent(new CustomEvent('toggle-wobble', { detail: true }));
          return "Window wobble effect has been enabled";
        }

        if (args[0] === "off" || args[0] === "disable") {
          document.dispatchEvent(new CustomEvent('toggle-wobble', { detail: false }));
          return "Window wobble effect has been disabled";
        }

        return "Usage: wobble [on|off|enable|disable]";
      },
      description: "Toggle window wobble effect"
    }
  };

  // Function to display neofetch-style output
  const displayNeofetch = () => {
    const systemInfo = [
      "\x1b[1;38;5;141mDeveloper:\x1b[0m Your Name",
      "\x1b[1;38;5;141mRole:\x1b[0m Full Stack Developer",
      "\x1b[1;38;5;141mSpecialty:\x1b[0m Web Development",
      "\x1b[1;38;5;141mExperience:\x1b[0m 5+ years",
      "\x1b[1;38;5;141mTechnologies:\x1b[0m React, Next.js, Node.js",
      "\x1b[1;38;5;141mLanguages:\x1b[0m JavaScript, TypeScript, Python",
      "\x1b[1;38;5;141mFrontend:\x1b[0m React, Next.js, TailwindCSS",
      "\x1b[1;38;5;141mBackend:\x1b[0m Node.js, Express, PostgreSQL",
      "\x1b[1;38;5;141mTools:\x1b[0m Git, Docker, AWS",
      "\x1b[1;38;5;141mShell:\x1b[0m Terminal Portfolio",
      "\x1b[1;38;5;141mLocation:\x1b[0m Remote",
      "",
      "\x1b[38;5;196m███\x1b[38;5;214m███\x1b[38;5;226m███\x1b[38;5;118m███\x1b[38;5;33m███\x1b[38;5;129m███\x1b[0m",
    ];

    // Combine the ASCII art with system info
    let output = "";
    const maxArtLines = neofetchArt.length;
    const maxInfoLines = systemInfo.length;
    const maxLines = Math.max(maxArtLines, maxInfoLines);

    for (let i = 0; i < maxLines; i++) {
      const artLine = i < maxArtLines ? neofetchArt[i] : "";
      const infoLine = i < maxInfoLines ? systemInfo[i] : "";
      output += `${artLine}    ${infoLine}\r\n`;
    }

    return output;
  };

  useEffect(() => {
    if (typeof window !== "undefined" && terminalRef.current && !xtermRef.current) {
      // Fix for SSR
      const initTerminal = async () => {
        try {
          // Create and configure terminal instance
          const term = new XTerminal({
            cursorBlink: true,
            cursorStyle: "bar",
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 14,
            lineHeight: 1.2,
            theme: {
              background: "rgba(35, 38, 52, 0.8)", // Semitransparent background
              foreground: "#c6d0f5", // Text
              cursor: "#ca9ee6", // Mauve
              selectionBackground: "#51576d", // Surface1
              black: "#292c3c", // Mantle
              blue: "#8caaee", // Blue
              cyan: "#81c8be", // Teal
              green: "#a6d189", // Green
              magenta: "#ca9ee6", // Mauve
              red: "#e78284", // Red
              white: "#c6d0f5", // Text
              yellow: "#e5c890", // Yellow
              brightBlack: "#414559", // Surface0
              brightBlue: "#8caaee", // Blue
              brightCyan: "#81c8be", // Teal
              brightGreen: "#a6d189", // Green
              brightMagenta: "#f4b8e4", // Pink
              brightRed: "#e78284", // Red
              brightWhite: "#c6d0f5", // Text
              brightYellow: "#e5c890", // Yellow
            },
            allowTransparency: true, // Enable transparency
          });

          const fitAddon = new FitAddon();
          term.loadAddon(fitAddon);
          term.open(terminalRef.current);

          // This timeout seems to solve the rendering issue with xterm.js
          setTimeout(() => {
            try {
              fitAddon.fit();
            } catch (e) {
              console.error("Error during initial fit:", e);
            }
          }, 100);

          // Store references
          xtermRef.current = term;
          fitAddonRef.current = fitAddon;

          // Type welcome message with animation
          await typeText(term, displayNeofetch());
          await typeText(term, "\r\n\x1b[1;38;5;141mWelcome to my portfolio terminal!\x1b[0m\r\n");
          await typeText(term, "Type '\x1b[1;38;5;110mhelp\x1b[0m' to see available commands.\r\n");
          term.write(prompt);

          // Setup input handling
          let currentCommand = "";
          let currentPosition = 0;

          term.onData(e => {
            const code = e.charCodeAt(0);

            // Handle arrow keys, enter, backspace, etc.
            if (code === 13) { // Enter
              // Process the command
              const trimmedCommand = currentCommand.trim();
              if (trimmedCommand) {
                // Add to history
                setCommandHistory(prev => [trimmedCommand, ...prev]);
                setHistoryIndex(-1);

                // Parse command and arguments
                const parts = trimmedCommand.split(" ");
                const cmd = parts[0];
                const args = parts.slice(1);

                // Execute command
                let output = "";
                if (commands[cmd]) {
                  output = commands[cmd].execute(args);
                } else if (cmd) {
                  output = `\x1b[38;5;203mCommand not found: ${cmd}. Type 'help' to see available commands.\x1b[0m`;
                }

                term.write("\r\n");
                if (output) {
                  term.write(formatOutput(output));
                }

                // Reset command and show new prompt
                currentCommand = "";
                currentPosition = 0;
                term.write(prompt);
              } else {
                // Empty command, just show new prompt
                term.write(`\r\n${prompt}`);
              }
            } else if (code === 127) { // Backspace
              if (currentPosition > 0) {
                currentCommand =
                  currentCommand.substring(0, currentPosition - 1) +
                  currentCommand.substring(currentPosition);
                currentPosition--;

                // Redraw the current line
                term.write("\b \b"); // Erase the char at cursor

                // If we deleted from the middle, redraw the whole line
                if (currentPosition < currentCommand.length) {
                  term.write(`\r${prompt}${currentCommand}`);
                  // Move cursor back to the right position
                  term.write(`\x1b[${prompt.length + currentPosition + 1}G`);
                }
              }
            } else if (e === "\u001b[A") { // Up arrow
              // Navigate history
              if (commandHistory.length > 0) {
                const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
                setHistoryIndex(newIndex);

                // Clear current line
                term.write(`\r${"".repeat(prompt.length + currentCommand.length)}\r`);
                term.write(prompt);

                // Set from history
                const historyCommand = commandHistory[newIndex];
                term.write(historyCommand);
                currentCommand = historyCommand;
                currentPosition = historyCommand.length;
              }
            } else if (e === "\u001b[B") { // Down arrow
              // Navigate history
              if (historyIndex > -1) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);

                // Clear current line
                term.write(`\r${"".repeat(prompt.length + currentCommand.length)}\r`);
                term.write(prompt);

                // Set from history or empty
                const historyCommand = newIndex >= 0 ? commandHistory[newIndex] : "";
                term.write(historyCommand);
                currentCommand = historyCommand;
                currentPosition = historyCommand.length;
              }
            } else if (e === "\u001b[C") { // Right arrow
              if (currentPosition < currentCommand.length) {
                currentPosition++;
                term.write(e);
              }
            } else if (e === "\u001b[D") { // Left arrow
              if (currentPosition > 0) {
                currentPosition--;
                term.write(e);
              }
            } else if (e === "\u0003") { // Ctrl+C
              term.write("^C");
              term.write(`\r\n${prompt}`);
              currentCommand = "";
              currentPosition = 0;
            } else if (code < 32 || code === 127) {
              // Ignore other control characters
            } else {
              // Regular character input
              if (currentPosition === currentCommand.length) {
                term.write(e);
                currentCommand += e;
                currentPosition++;
              } else {
                // Insert character at cursor position
                currentCommand =
                  currentCommand.substring(0, currentPosition) +
                  e +
                  currentCommand.substring(currentPosition);
                currentPosition++;

                // Redraw the whole line
                term.write(`\r${prompt}${currentCommand}`);
                // Move cursor back to the right position
                term.write(`\x1b[${prompt.length + currentPosition + 1}G`);
              }
            }
          });

          // Handle window resize
          const handleResize = () => {
            try {
              if (fitAddonRef.current) {
                fitAddonRef.current.fit();
              }
            } catch (e) {
              console.error("Error resizing terminal:", e);
            }
          };

          window.addEventListener("resize", handleResize);

          return () => {
            window.removeEventListener("resize", handleResize);
            term.dispose();
          };
        } catch (error) {
          console.error("Terminal initialization error:", error);
        }
      };

      initTerminal();
    }
  }, [commandHistory, historyIndex]);

  return (
    <div className={`terminal-container ${className || ""} backdrop-blur-sm`}>
      <div ref={terminalRef} className="h-full" />
    </div>
  );
};

export default Terminal;
