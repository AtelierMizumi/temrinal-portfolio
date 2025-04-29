"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Music, 
  Image,
  Paintbrush, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  X,
  Volume2,
  VolumeX,
  ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import fs from 'fs';
import path from 'path';
import { useTheme } from "./theme-provider";
import ColorPalette from './ColorPalette';
import { animate } from "animejs";

interface TopBarProps {
  onArchClick?: () => void;
  onBackgroundChange?: () => void;
  onMusicOpen?: () => void;
  onColorChange?: (colorHsl: string, colorName: string) => void;
  onBackgroundSelectorOpen?: () => void;
}

interface Song {
  id: string;
  name: string;
  artist: string;
  path: string;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onArchClick = () => {}, 
  onBackgroundChange, 
  onMusicOpen,
  onColorChange,
  onBackgroundSelectorOpen
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  // Use the enhanced theme context
  const { cycleTheme, changeAccentColor } = useTheme();

  // Demo songs data
  const songs: Song[] = [
    { id: "1", name: "Lofi Study", artist: "Chillhop", path: "/music/lofi1.mp3" },
    { id: "2", name: "Midnight Jazz", artist: "Jazzy Vibes", path: "/music/jazz1.mp3" },
    { id: "3", name: "Ambient Space", artist: "Cosmic Dreams", path: "/music/ambient1.mp3" },
  ];

  useEffect(() => {
    // Update clock every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Initialize audio element
    const audio = new Audio();
    setAudioElement(audio);
    
    // Fetch background images
    const loadBackgrounds = async () => {
      try {
        // In a real app, this would be a server API call
        // For now, let's assume we have these backgrounds
        setBackgrounds([
            "/backgrounds/cyan-mountains.jpg",
            "/backgrounds/islands.jpg",
            "/backgrounds/yosemite.png",
            "/backgrounds/blocks.png",
            "/backgrounds/cat_pacman.png",
            "/backgrounds/comfy-home.png",
            "/backgrounds/red_bkg5.png",
            "/backgrounds/blue_green.png",
            "/backgrounds/cyan-gradient.png",
            "/backgrounds/nilou.mp4",
            "/backgrounds/stonks9800-sunset.mp4",  
        ]);
        
      } catch (error) {
        console.error("Failed to load backgrounds:", error);
      }
    };
    
    loadBackgrounds();

    return () => {
      clearInterval(interval);
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }
    };
  }, []);

  // Play/pause music
  const togglePlay = () => {
    if (!audioElement || !currentSong) {
      if (songs.length > 0 && audioElement) {
        setCurrentSong(songs[0]);
        audioElement.src = songs[0].path;
        audioElement.play();
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Skip to next song
  const nextSong = () => {
    if (!currentSong || !audioElement) return;
    
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    audioElement.src = songs[nextIndex].path;
    
    if (isPlaying) {
      audioElement.play();
    }
  };

  // Skip to previous song
  const prevSong = () => {
    if (!currentSong || !audioElement) return;
    
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    audioElement.src = songs[prevIndex].path;
    
    if (isPlaying) {
      audioElement.play();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioElement) return;
    
    audioElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Change volume
  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioElement) return;
    
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    audioElement.volume = newVolume / 100;
    
    if (newVolume === 0) {
      setIsMuted(true);
      audioElement.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audioElement.muted = false;
    }
  };

  // Change backgrounds/theme
  const changeBackground = () => {
    // Use theme context to cycle themes
    cycleTheme();
    
    // Also call the passed in handler if available
    if (onBackgroundChange) {
      onBackgroundChange();
    }
  };

  // Handle opening background selector
  const handleBackgroundSelectorOpen = () => {
    if (onBackgroundSelectorOpen) {
      onBackgroundSelectorOpen();
    }
  };

  // Replace handleColorChange to use the context
  const handleColorChange = (colorHsl: string, colorName: string) => {
    // Use the context function instead of direct DOM manipulation
    changeAccentColor(colorHsl, colorName);
    
    // Call external handler if provided
    if (onColorChange) {
      onColorChange(colorHsl, colorName);
    }
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 h-12 bg-[#252525]/40 backdrop-blur-lg border-b border-[#424242]/30 flex items-center justify-between px-4 z-50">
        {/* Left section - Arch menu button */}
        <div className="flex items-center">
          <button 
            onClick={onArchClick}
            className="arch-button flex items-center justify-center w-9 h-9 rounded-full bg-blue-500/20 hover:bg-blue-500/40 backdrop-blur-md transition-colors"
          >
            <img src="/arch-linux.png" alt="Arch Linux" className="w-5 h-5" />
          </button>
        </div>

        {/* Middle section - Date and Music */}
        <div className="flex items-center space-x-4">
          {/* Date and time */}
          <div className="bg-[#2a2a2a]/60 backdrop-blur-md text-gray-300 flex items-center px-3 py-1.5 rounded-full">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {format(currentTime, "MMMM d, yyyy")}
            </span>
          </div>

          {/* Music controller */}
          <div className="bg-[#2a2a2a]/60 backdrop-blur-md text-gray-300 flex items-center px-3 py-1.5 rounded-full">
            <button 
              onClick={() => {
                if (onMusicOpen) {
                  onMusicOpen();
                } else {
                  setIsMusicPlayerOpen(!isMusicPlayerOpen);
                }
              }}
              className="flex items-center hover:text-white transition-colors"
            >
              <Music className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {currentSong ? `${currentSong.name} - ${currentSong.artist}` : "Music"}
              </span>
            </button>
          </div>
        </div>

        {/* Right section - Theme buttons */}
        <div className="flex items-center space-x-3">
          <ColorPalette onColorChange={handleColorChange} />
          
          <button 
            onClick={handleBackgroundSelectorOpen}
            className="bg-[#2a2a2a]/60 backdrop-blur-md flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#3a3a3a]/60 transition-colors"
            title="Select Background"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          
          <button 
            onClick={changeBackground}
            className="theme-button bg-[#2a2a2a]/60 backdrop-blur-md flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#3a3a3a]/60 transition-colors"
            title="Change theme"
          >
            <Paintbrush className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Music Player Dialog - Only shown when using TopBar's internal player */}
      <AnimatePresence>
        {isMusicPlayerOpen && !onMusicOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 left-1/2 transform -translate-x-1/2 w-80 bg-[#1a1a1a] rounded-lg shadow-xl border border-[#333] z-50 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-300 font-semibold">Music Player</h3>
                <button 
                  onClick={() => setIsMusicPlayerOpen(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#252525] rounded-lg p-3 mb-3">
                <div className="text-gray-200 text-center mb-2">
                  {currentSong ? (
                    <>
                      <h4 className="font-medium">{currentSong.name}</h4>
                      <p className="text-gray-400 text-sm">{currentSong.artist}</p>
                    </>
                  ) : (
                    <p className="text-gray-400">Select a song to play</p>
                  )}
                </div>

                <div className="flex justify-center items-center space-x-4 my-4">
                  <button onClick={prevSong} className="text-gray-300 hover:text-white">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={togglePlay} 
                    className="bg-blue-600 hover:bg-blue-700 rounded-full p-2"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button onClick={nextSong} className="text-gray-300 hover:text-white">
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="text-gray-300 hover:text-white">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={changeVolume}
                    className="w-full h-1.5 rounded-lg appearance-none bg-[#333] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto">
                <h4 className="text-gray-400 text-xs uppercase font-semibold mb-2">Library</h4>
                <ul className="space-y-1">
                  {songs.map((song) => (
                    <li key={song.id}>
                      <button
                        onClick={() => {
                          setCurrentSong(song);
                          if (audioElement) {
                            audioElement.src = song.path;
                            audioElement.play();
                            setIsPlaying(true);
                          }
                        }}
                        className={`w-full text-left p-2 rounded-md text-sm hover:bg-[#303030] ${
                          currentSong?.id === song.id ? "bg-[#303030] text-blue-400" : "text-gray-300"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="flex-grow">
                            <p className="font-medium truncate">{song.name}</p>
                            <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                          </div>
                          {currentSong?.id === song.id && isPlaying && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};