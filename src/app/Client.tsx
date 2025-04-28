import { Terminal } from "@/components/Terminal";
import { Music } from "@/components/Music";
import { useWobbleEffect } from "@/components/window-wobble-provider";
import { BackgroundSelector } from "@/components/BackgroundSelector";
import { useCallback, useEffect, useState } from "react";
import { WindowManager, Window } from "@/components/WindowManager";
import { TaskBar } from "@/components/TaskBar";

// Define window type
interface Window {
  id: string;
  type: string;
  title: string;
  zIndex: number;
  initialX: number;
  initialY: number;
  initialWidth?: number;
  initialHeight?: number;
}

export default function Client() {
  const [windows, setWindows] = useState<Window[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const { toggleWobble, wobbleEnabled } = useWobbleEffect();
  const [background, setBackground] = useState("clearday.jpg"); // Default background

  // Handle background change
  const handleBackgroundChange = (bg: string) => {
    setBackground(bg);
    // Save preference to localStorage
    localStorage.setItem("preferred-background", bg);
  };

  // Load saved background preference
  useEffect(() => {
    const savedBg = localStorage.getItem("preferred-background");
    if (savedBg) {
      setBackground(savedBg);
    }
  }, []);

  // Bring a window to the front
  const bringToFront = useCallback((id: string) => {
    if (activeWindowId === id) return;
    
    setWindows(prevWindows => {
      // If the window doesn't exist anymore, do nothing
      if (!prevWindows.find(w => w.id === id)) return prevWindows;
      
      const newMaxZIndex = maxZIndex + 1;
      const newWindows = prevWindows.map(window => {
        if (window.id === id) {
          return { ...window, zIndex: newMaxZIndex };
        }
        return window;
      });
      
      setMaxZIndex(newMaxZIndex);
      return newWindows;
    });
    
    setActiveWindowId(id);
  }, [maxZIndex, activeWindowId]);

  // Close a window
  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  // Create a new terminal window
  const createTerminal = useCallback(() => {
    const newZIndex = maxZIndex + 1;
    const offsetX = Math.floor(Math.random() * 100);
    const offsetY = Math.floor(Math.random() * 100);
    const newId = `terminal-${Date.now()}`;
    
    setWindows(prev => [
      ...prev,
      {
        id: newId,
        type: "terminal",
        zIndex: newZIndex,
        initialX: 100 + offsetX,
        initialY: 100 + offsetY,
        title: "Terminal",
        initialWidth: 800,
        initialHeight: 500
      }
    ]);
    
    setMaxZIndex(newZIndex);
    setActiveWindowId(newId);
  }, [maxZIndex]);

  // Open music player window
  const openMusicPlayer = useCallback(() => {
    const newZIndex = maxZIndex + 1;
    const newId = `music-${Date.now()}`;
    
    setWindows(prev => [
      ...prev,
      {
        id: newId,
        type: "music",
        zIndex: newZIndex,
        initialX: 150,
        initialY: 100,
        title: "Music Player",
        initialWidth: 600,
        initialHeight: 400
      }
    ]);
    
    setMaxZIndex(newZIndex);
    setActiveWindowId(newId);
  }, [maxZIndex]);

  // Play sound for interactions
  const playClickSound = () => {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.3;
    audio.play().catch(err => console.error('Error playing sound:', err));
  };

  return (
    <div 
      className="desktop h-screen w-screen overflow-hidden relative"
      style={{
        backgroundImage: `url(/backgrounds/${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 0.5s ease-in-out'
      }}
    >
      {/* Render Windows */}
      <WindowManager>
        {windows.map((window) => {
          const isActive = window.id === activeWindowId;
          
          return (
            <Window
              key={window.id}
              id={window.id}
              title={window.title}
              zIndex={isActive ? maxZIndex : window.zIndex}
              initialX={window.initialX}
              initialY={window.initialY}
              initialWidth={window.initialWidth || 800}
              initialHeight={window.initialHeight || 500}
              className={isActive ? "border-blue-500" : ""}
              onFocus={() => bringToFront(window.id)}
              onClose={() => closeWindow(window.id)}
            >
              {window.type === "terminal" && <Terminal />}
              {window.type === "music" && <Music />}
              {window.type === "explorer" && <div className="p-4">File Explorer Content</div>}
            </Window>
          );
        })}
      </WindowManager>
      
      {/* Taskbar */}
      <TaskBar
        onArchClick={() => {
          playClickSound();
          createTerminal();
        }}
        extraButtons={
          <>
            <button
              onClick={() => {
                playClickSound();
                toggleWobble();
              }}
              className="p-2 hover:bg-card/50 rounded-md"
              title={wobbleEnabled ? "Disable Window Wobble" : "Enable Window Wobble"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {wobbleEnabled ? (
                  <>
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="12" y1="2" x2="12" y2="22" />
                  </>
                ) : (
                  <>
                    <path d="M4 12c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                    <path d="M4 12c0 3.3 2.7 6 6 6s6-2.7 6-6" />
                  </>
                )}
              </svg>
            </button>
            
            <BackgroundSelector onSelect={handleBackgroundChange} />
            
            <button
              onClick={() => {
                playClickSound();
                openMusicPlayer();
              }}
              className="p-2 hover:bg-card/50 rounded-md"
              title="Open Music Player"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </button>
          </>
        }
      />
    </div>
  );
}