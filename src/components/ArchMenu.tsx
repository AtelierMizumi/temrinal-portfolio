"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Gamepad, Music, Info, FileText, X } from "lucide-react";

interface ArchMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onTerminalOpen: () => void;
  onMusicOpen?: () => void;
  onGameMenuOpen: () => void;
}

export const ArchMenu: React.FC<ArchMenuProps> = ({
  isOpen,
  onClose,
  onTerminalOpen,
  onMusicOpen,
  onGameMenuOpen,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="absolute left-4 top-12 w-64 bg-[#1e1e2e] border border-[#313244] rounded-lg shadow-xl z-50 overflow-hidden"
        >
          <div className="p-2">
            <div className="flex justify-between items-center p-2">
              <span className="text-gray-300 font-medium">Menu</span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-1">
              <button
                onClick={() => {
                  onTerminalOpen();
                  onClose();
                }}
                className="flex items-center p-2 rounded-md text-left hover:bg-[#313244] group"
              >
                <div className="w-8 h-8 bg-[#313244] group-hover:bg-[#45475a] rounded-full flex items-center justify-center mr-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-gray-300 font-medium">Terminal</div>
                  <div className="text-gray-500 text-xs">Command line interface</div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (onMusicOpen) {
                    onMusicOpen();
                    onClose();
                  }
                }}
                className="flex items-center p-2 rounded-md text-left hover:bg-[#313244] group"
              >
                <div className="w-8 h-8 bg-[#313244] group-hover:bg-[#45475a] rounded-full flex items-center justify-center mr-2">
                  <Music className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="text-gray-300 font-medium">Music Player</div>
                  <div className="text-gray-500 text-xs">Listen to music</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onGameMenuOpen();
                }}
                className="flex items-center p-2 rounded-md text-left hover:bg-[#313244] group"
              >
                <div className="w-8 h-8 bg-[#313244] group-hover:bg-[#45475a] rounded-full flex items-center justify-center mr-2">
                  <Gamepad className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-gray-300 font-medium">Arcade Games</div>
                  <div className="text-gray-500 text-xs">Play browser games</div>
                </div>
              </button>

              <button className="flex items-center p-2 rounded-md text-left hover:bg-[#313244] group">
                <div className="w-8 h-8 bg-[#313244] group-hover:bg-[#45475a] rounded-full flex items-center justify-center mr-2">
                  <Info className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <div className="text-gray-300 font-medium">About</div>
                  <div className="text-gray-500 text-xs">Project information</div>
                </div>
              </button>

              <button className="flex items-center p-2 rounded-md text-left hover:bg-[#313244] group">
                <div className="w-8 h-8 bg-[#313244] group-hover:bg-[#45475a] rounded-full flex items-center justify-center mr-2">
                  <FileText className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="text-gray-300 font-medium">Resume</div>
                  <div className="text-gray-500 text-xs">View my resume</div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-2 py-2 px-4 bg-[#181825] border-t border-[#313244]">
            <div className="text-gray-400 text-xs">Terminal Portfolio</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};