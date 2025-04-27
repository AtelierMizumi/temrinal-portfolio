"use client";

import React, { useState } from "react";
import { WindowManager, Window } from "@/components/WindowManager";
import Terminal from "@/components/Terminal";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  // Single window for terminal
  const [zIndex, setZIndex] = useState(100);

  return (
    <div className="desktop bg-gradient-to-br from-base to-mantle bg-fixed min-h-screen min-w-full relative">
      {/* Theme toggle button */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Terminal window */}
      <Window
        id="terminal"
        title="Terminal"
        zIndex={zIndex}
        initialX={60}
        initialY={60}
        initialWidth={800}
        initialHeight={550}
        className="terminal-window"
      >
        <Terminal />
      </Window>

      {/* Background pattern (optional) */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
    </div>
  );
}
