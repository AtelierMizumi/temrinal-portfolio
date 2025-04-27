"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Window, WindowManager } from "../components/WindowManager";
import dynamic from 'next/dynamic';
import { TopBar } from "../components/TopBar";
import { ArchMenu } from "../components/ArchMenu";
import { GamesExplorer } from "../components/GamesExplorer";
import { WobbleProvider } from "../components/window-wobble-provider";
import { ThemeProvider } from "../components/theme-provider";
import { animate, createScope } from "animejs";
import MusicPlayer from "../components/MusicPlayer";

// Dynamically import Terminal to prevent SSR issues
const Terminal = dynamic(() => import('../components/Terminal'), { 
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center bg-gray-800">
    <p className="text-gray-300">Terminal loading...</p>
  </div>
});

// Type for windows
interface WindowData {
  id: string;
  type: "terminal" | "game" | "explorer" | "music";
  zIndex: number;
  initialX: number;
  initialY: number;
  title: string;
  gameId?: string;
  songId?: string;
}

// Window manager with state
export const Client: React.FC = () => {
  const [windows, setWindows] = useState<WindowData[]>([
    {
      id: "terminal-1",
      type: "terminal",
      zIndex: 1,
      initialX: 100,
      initialY: 100,
      title: "Terminal",
    },
  ]);
  const [archMenuOpen, setArchMenuOpen] = useState(false);
  const [activeWindowId, setActiveWindowId] = useState<string>("terminal-1");
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [gamesExplorerOpen, setGamesExplorerOpen] = useState(false);
  const [currentBackground, setCurrentBackground] = useState("/background/bg1.jpg");
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  
  const clientRef = useRef<HTMLDivElement>(null);
  const animationScope = useRef<any>(null);

  // Available backgrounds
  const backgrounds = [
    "/background/bg1.jpg",
    "/background/bg2.jpg",
    "/background/bg3.jpg",
    "/background/bg4.jpg",
  ];

  // Function to cycle backgrounds
  const cycleBackground = useCallback(() => {
    const nextIndex = (backgroundIndex + 1) % backgrounds.length;
    setBackgroundIndex(nextIndex);
    setCurrentBackground(backgrounds[nextIndex]);
  }, [backgroundIndex, backgrounds]);

  // Function to bring a window to front
  const bringToFront = useCallback((id: string) => {
    setWindows((prev) => {
      const newWindows = [...prev];
      const newMaxZIndex = maxZIndex + 1;
      const windowIndex = newWindows.findIndex((w) => w.id === id);
      
      if (windowIndex !== -1) {
        newWindows[windowIndex] = {
          ...newWindows[windowIndex],
          zIndex: newMaxZIndex,
        };
      }
      
      setMaxZIndex(newMaxZIndex);
      return newWindows;
    });
    
    setActiveWindowId(id);
  }, [maxZIndex]);

  // Create a new terminal window
  const createTerminal = useCallback(() => {
    const newZIndex = maxZIndex + 1;
    const offsetX = Math.floor(Math.random() * 100);
    const offsetY = Math.floor(Math.random() * 100);
    const newId = `terminal-${Date.now()}`;
    
    setWindows((prev) => [
      ...prev,
      {
        id: newId,
        type: "terminal",
        zIndex: newZIndex,
        initialX: 120 + offsetX,
        initialY: 120 + offsetY,
        title: "Terminal",
      },
    ]);
    
    setMaxZIndex(newZIndex);
    setActiveWindowId(newId);
  }, [maxZIndex]);

  // Create a music player window
  const openMusicPlayer = useCallback(() => {
    const newZIndex = maxZIndex + 1;
    const newId = `music-${Date.now()}`;
    
    setWindows((prev) => [
      ...prev,
      {
        id: newId,
        type: "music",
        zIndex: newZIndex,
        initialX: 150,
        initialY: 100,
        title: "Music Player",
      },
    ]);
    
    setMaxZIndex(newZIndex);
    setActiveWindowId(newId);
  }, [maxZIndex]);

  // Close a window
  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Handle game launch
  const handleGameLaunch = useCallback((game: any) => {
    const newZIndex = maxZIndex + 1;
    const newId = `game-${Date.now()}`;
    
    setWindows((prev) => [
      ...prev,
      {
        id: newId,
        type: "game",
        gameId: game.id,
        zIndex: newZIndex,
        initialX: 150,
        initialY: 100,
        title: game.name,
      },
    ]);
    
    setMaxZIndex(newZIndex);
    setActiveWindowId(newId);
    setGamesExplorerOpen(false);
  }, [maxZIndex]);

  // Set up animations with createScope
  useEffect(() => {
    if (!clientRef.current) return;
    
    animationScope.current = createScope({ root: clientRef }).add(self => {
      // Register methods that can be called from outside useEffect
      self.add('archButtonAnimation', () => {
        animate('.arch-button', {
          scale: [1, 1.2, 1],
          duration: 300,
          easing: 'inOutQuad'
        });
      });
    });

    return () => {
      if (animationScope.current) {
        animationScope.current.revert();
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <WobbleProvider>
        <WindowManager>
          <div ref={clientRef} className="relative w-screen h-screen overflow-hidden bg-background">
            {/* Desktop background */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{
                backgroundImage: `url('${currentBackground}')`,
              }}
            />

            {/* Windows */}
            {windows.map((window) => {
              if (window.type === "terminal") {
                return (
                  <Window
                    key={window.id}
                    id={window.id}
                    title={window.title}
                    zIndex={window.zIndex}
                    initialX={window.initialX}
                    initialY={window.initialY}
                    initialWidth={600}
                    initialHeight={400}
                    onClose={() => closeWindow(window.id)}
                    onFocus={() => bringToFront(window.id)}
                    showDate={true}
                  >
                    <Terminal className="h-full" />
                  </Window>
                );
              }
              if (window.type === "music") {
                return (
                  <Window
                    key={window.id}
                    id={window.id}
                    title={window.title}
                    zIndex={window.zIndex}
                    initialX={window.initialX}
                    initialY={window.initialY}
                    initialWidth={400}
                    initialHeight={550}
                    onClose={() => closeWindow(window.id)}
                    onFocus={() => bringToFront(window.id)}
                    showDate={false}
                  >
                    <MusicPlayer className="h-full" />
                  </Window>
                );
              }
              if (window.type === "game") {
                return (
                  <Window
                    key={window.id}
                    id={window.id}
                    title={window.title}
                    zIndex={window.zIndex}
                    initialX={window.initialX}
                    initialY={window.initialY}
                    initialWidth={800}
                    initialHeight={600}
                    onClose={() => closeWindow(window.id)}
                    onFocus={() => bringToFront(window.id)}
                    showDate={false}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <div className="text-center">
                        <div className="text-4xl mb-4">
                          {window.gameId === "flappy-bird" && "🐦"}
                          {window.gameId === "mario" && "🍄"}
                          {window.gameId === "tetris" && "🧱"}
                          {window.gameId === "snake" && "🐍"}
                          {window.gameId === "chess" && "♟️"}
                        </div>
                        <h2 className="text-2xl font-bold text-text mb-3">{window.title}</h2>
                        <p className="text-text/70 mb-4">Game loading... Please wait</p>
                        <div className="w-64 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
                          <div className="h-full bg-blue-500 loading-bar"></div>
                        </div>
                      </div>
                    </div>
                  </Window>
                );
              }
              return null;
            })}

            {/* Games Explorer Window */}
            <GamesExplorer
              isOpen={gamesExplorerOpen}
              zIndex={maxZIndex + 1}
              onClose={() => setGamesExplorerOpen(false)}
              onGameLaunch={handleGameLaunch}
            />

            {/* Desktop UI Components */}
            <TopBar
              onArchClick={() => {
                setArchMenuOpen(!archMenuOpen);
                if (animationScope.current?.methods?.archButtonAnimation) {
                  animationScope.current.methods.archButtonAnimation();
                }
              }}
              onMusicOpen={openMusicPlayer}
              onBackgroundChange={cycleBackground}
            />
            
            <ArchMenu
              isOpen={archMenuOpen}
              onClose={() => setArchMenuOpen(false)}
              onTerminalOpen={createTerminal}
              onMusicOpen={openMusicPlayer}
              onGameMenuOpen={() => {
                setGamesExplorerOpen(true);
                setArchMenuOpen(false);
              }}
            />
            
            <style jsx global>{`
              .loading-bar {
                width: 30%;
                animation: loading 2s infinite ease-in-out;
              }
              
              @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(400%); }
              }
            `}</style>
          </div>
        </WindowManager>
      </WobbleProvider>
    </ThemeProvider>
  );
};

export default Client;