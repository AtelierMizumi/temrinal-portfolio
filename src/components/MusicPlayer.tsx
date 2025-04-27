"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  VolumeX
} from "lucide-react";

interface MusicPlayerProps {
  className?: string;
}

interface Song {
  id: string;
  name: string;
  artist: string;
  path: string;
  cover?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Demo songs data
  const songs: Song[] = [
    { 
      id: "1", 
      name: "Lofi Study", 
      artist: "Chillhop", 
      path: "/music/lofi1.mp3",
      cover: "/music/covers/lofi1.jpg"
    },
    { 
      id: "2", 
      name: "Midnight Jazz", 
      artist: "Jazzy Vibes", 
      path: "/music/jazz1.mp3",
      cover: "/music/covers/jazz1.jpg" 
    },
    { 
      id: "3", 
      name: "Ambient Space", 
      artist: "Cosmic Dreams", 
      path: "/music/ambient1.mp3",
      cover: "/music/covers/ambient1.jpg"
    },
  ];

  useEffect(() => {
    // Initialize audio element
    const audio = new Audio();
    audio.volume = volume / 100;
    audioRef.current = audio;
    
    // Set up event listeners
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener("ended", handleSongEnd);
    
    // Load first song by default
    if (songs.length > 0) {
      setCurrentSong(songs[0]);
      audio.src = songs[0].path;
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.removeEventListener("ended", handleSongEnd);
      }
    };
  }, []);

  // Handle song end
  const handleSongEnd = () => {
    nextSong();
  };

  // Update progress bar
  const updateProgress = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      audioRef.current.play();
      progressIntervalRef.current = setInterval(updateProgress, 1000);
    }
    
    setIsPlaying(!isPlaying);
  };

  // Skip to next song
  const nextSong = () => {
    if (!currentSong || !audioRef.current) return;
    
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
    audioRef.current.src = songs[nextIndex].path;
    setProgress(0);
    
    if (isPlaying) {
      audioRef.current.play();
    }
  };

  // Skip to previous song
  const prevSong = () => {
    if (!currentSong || !audioRef.current) return;
    
    const currentIndex = songs.findIndex(song => song.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
    audioRef.current.src = songs[prevIndex].path;
    setProgress(0);
    
    if (isPlaying) {
      audioRef.current.play();
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Change volume
  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    audioRef.current.volume = newVolume / 100;
    
    if (newVolume === 0) {
      setIsMuted(true);
      audioRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };

  // Seek in track
  const seekTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setProgress(seekTime);
  };

  return (
    <div className={`h-full bg-[#1a1b26] text-gray-300 p-4 flex flex-col ${className}`}>
      {/* Album cover and song info */}
      <div className="flex-grow flex flex-col items-center justify-center mb-6">
        <div className="w-48 h-48 bg-[#252525] rounded-lg overflow-hidden shadow-lg mb-4 relative">
          {currentSong?.cover ? (
            <img 
              src={currentSong.cover} 
              alt={currentSong.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700">
              <Music className="w-16 h-16 text-white opacity-40" />
            </div>
          )}
          
          <div className={`absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full flex items-center justify-center backdrop-blur-sm">
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-1">
            {currentSong?.name || "No song selected"}
          </h3>
          <p className="text-gray-400">
            {currentSong?.artist || "Unknown artist"}
          </p>
        </div>
      </div>
      
      {/* Playback controls */}
      <div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs">{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={progress}
            onChange={seekTrack}
            className="flex-grow h-1 appearance-none bg-gray-700 rounded-lg overflow-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
          />
          <span className="text-xs">{formatTime(duration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button 
            onClick={prevSong} 
            className="text-gray-300 hover:text-white"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={togglePlay}
            className="bg-blue-600 hover:bg-blue-700 rounded-full p-3 text-white"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
          
          <button 
            onClick={nextSong} 
            className="text-gray-300 hover:text-white"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
        
        {/* Volume control */}
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="text-gray-400 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={changeVolume}
            className="flex-grow h-1 appearance-none bg-gray-700 rounded-lg overflow-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
          />
        </div>
      </div>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default MusicPlayer;