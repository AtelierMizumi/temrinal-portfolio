import React, { useEffect, useRef } from "react";
import { animate } from "animejs";

interface ArchMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onTerminalOpen?: () => void; // Add this prop for terminal spawning
  onGameMenuOpen?: () => void; // Add this prop for games menu
}

export const ArchMenu: React.FC<ArchMenuProps> = ({ 
  isOpen, 
  onClose, 
  onTerminalOpen,
  onGameMenuOpen
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Enhanced animation for menu opening
      animate(menuRef.current, {
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className={`arch-menu absolute bottom-12 left-3 rounded-lg shadow-lg overflow-hidden z-50 ${
        isOpen ? "block" : "hidden"
      }`}
      style={{
        backgroundColor: "rgba(20, 22, 30, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(81, 87, 109, 0.3)",
        minWidth: "200px",
      }}
    >
      <div className="flex flex-col p-1">
        <MenuOption 
          icon="🏠" 
          label="Home" 
          onClick={() => {
            // Home action
            if (menuRef.current) {
              animate(menuRef.current, {
                opacity: 0,
                translateY: -10,
                duration: 200,
                easing: 'easeOutQuad',
                complete: onClose
              });
            } else {
              onClose();
            }
          }} 
        />
        <MenuOption 
          icon="💻" 
          label="Terminal" 
          onClick={() => {
            if (onTerminalOpen && menuRef.current) {
              // Animate before spawning new terminal
              animate(menuRef.current, {
                opacity: [1, 0],
                translateY: [0, -10],
                duration: 200,
                easing: 'easeOutQuad',
                complete: () => {
                  onClose();
                  onTerminalOpen();
                }
              });
            } else {
              onClose();
            }
          }} 
        />
        <MenuOption 
          icon="🎮" 
          label="Games" 
          onClick={() => {
            if (onGameMenuOpen && menuRef.current) {
              // Animate before opening games menu
              animate(menuRef.current, {
                opacity: [1, 0],
                translateY: [0, -10],
                duration: 200,
                easing: 'easeOutQuad',
                complete: () => {
                  onClose();
                  onGameMenuOpen();
                }
              });
            } else {
              onClose();
            }
          }} 
        />
        
        {/* ...existing menu options... */}
      </div>
    </div>
  );
};

interface MenuOptionProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const MenuOption: React.FC<MenuOptionProps> = ({ icon, label, onClick }) => {
  return (
    <div
      className="menu-option flex items-center p-2 cursor-pointer hover:bg-gray-700 rounded-md"
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </div>
  );
};