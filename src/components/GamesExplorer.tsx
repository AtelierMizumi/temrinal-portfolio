import React, { useState, useEffect, useRef } from "react";
import { Window } from "./WindowManager";
import { animate } from "animejs";

interface GameItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  launchCommand?: string;
}

interface GamesExplorerProps {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
  onGameLaunch?: (game: GameItem) => void;
}

const GAMES_LIST: GameItem[] = [
  {
    id: "flappy-bird",
    name: "Flappy Bird",
    icon: "🐦",
    description: "Classic flappy bird game. Tap to fly through pipes!",
    launchCommand: "launch-flappy"
  },
  {
    id: "mario",
    name: "Super Mario",
    icon: "🍄",
    description: "The classic platformer game, Mario!",
    launchCommand: "launch-mario"
  },
  {
    id: "tetris",
    name: "Tetris",
    icon: "🧱",
    description: "Arrange falling blocks to create complete lines.",
    launchCommand: "launch-tetris"
  },
  {
    id: "snake",
    name: "Snake",
    icon: "🐍",
    description: "Eat food and grow longer without hitting yourself.",
    launchCommand: "launch-snake"
  },
  {
    id: "chess",
    name: "Chess",
    icon: "♟️",
    description: "The classic strategy board game.",
    launchCommand: "launch-chess"
  }
];

export const GamesExplorer: React.FC<GamesExplorerProps> = ({
  isOpen,
  zIndex,
  onClose,
  onGameLaunch
}) => {
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const explorerRef = useRef<HTMLDivElement>(null);

  // Reset selection when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedGame(null);
    }
  }, [isOpen]);

  const handleGameClick = (game: GameItem) => {
    setSelectedGame(game);
  };

  const handleGameDoubleClick = (game: GameItem) => {
    if (onGameLaunch) {
      onGameLaunch(game);
    }
  };

  const handleLaunchGame = () => {
    if (selectedGame && onGameLaunch) {
      onGameLaunch(selectedGame);
    }
  };

  useEffect(() => {
    if (isOpen && explorerRef.current) {
      animate(explorerRef.current, {
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Window
      id="games-explorer"
      title="Games Explorer"
      zIndex={zIndex}
      initialX={100}
      initialY={100}
      initialWidth={600}
      initialHeight={400}
      onClose={() => {
        if (explorerRef.current) {
          animate(explorerRef.current, {
            opacity: [1, 0],
            translateY: [0, -20],
            duration: 200,
            easing: 'easeOutQuad',
            complete: onClose
          });
        } else {
          onClose();
        }
      }}
      showDate={true}
    >
      <div ref={explorerRef} className="flex h-full">
        {/* Left sidebar */}
        <div className="w-1/4 border-r border-gray-700 p-3">
          <h3 className="text-text font-medium mb-3">Categories</h3>
          <div className="text-text/80 hover:text-text cursor-pointer p-2 rounded-md hover:bg-gray-700 mb-1 flex items-center">
            <span className="mr-2">🎮</span>All Games
          </div>
          <div className="text-text/60 hover:text-text cursor-pointer p-2 rounded-md hover:bg-gray-700 mb-1 flex items-center">
            <span className="mr-2">⭐</span>Favorites
          </div>
          <div className="text-text/60 hover:text-text cursor-pointer p-2 rounded-md hover:bg-gray-700 mb-1 flex items-center">
            <span className="mr-2">🔥</span>Popular
          </div>
        </div>

        {/* Main content */}
        <div className="w-3/4 p-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-text font-medium">Games Library</h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search games..."
                className="bg-gray-700/50 text-text border border-gray-600 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-2 top-1.5 text-text/60">🔍</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {GAMES_LIST.map(game => (
              <div 
                key={game.id}
                className={`game-item p-3 rounded-md border cursor-pointer transition-all duration-200 ${
                  selectedGame?.id === game.id 
                    ? 'border-blue-500 bg-gray-700/70' 
                    : 'border-gray-700 hover:border-gray-500 hover:bg-gray-700/30'
                }`}
                onClick={() => handleGameClick(game)}
                onDoubleClick={() => handleGameDoubleClick(game)}
                onMouseEnter={(e) => {
                  animate(e.currentTarget, {
                    scale: 1.05,
                    duration: 200,
                    easing: 'easeOutQuad'
                  });
                }}
                onMouseLeave={(e) => {
                  animate(e.currentTarget, {
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                  });
                }}
              >
                <div className="flex items-start">
                  <div className="game-icon text-3xl mr-3">{game.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-text font-medium">{game.name}</h3>
                    <p className="text-text/70 text-sm mt-1 line-clamp-2">{game.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedGame && (
            <div className="mt-4 flex justify-end">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={handleLaunchGame}
              >
                Launch Game
              </button>
            </div>
          )}
        </div>
      </div>
    </Window>
  );
};