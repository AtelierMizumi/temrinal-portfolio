"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  Repeat,
  Shuffle,
  Info
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
  const [isLooping, setIsLooping] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Demo songs data
  const songs: Song[] = [
    { 
      id: "1", 
      name: "Mila's OST", 
      artist: "MakenCat", 
      path: "/music/makencat-ambient-mila.mp3",
      cover: "/music/covers/makencat-ambient-mila.png"
    },
    { 
      id: "2", 
      name: "First Day", 
      artist: "MakenCat", 
      path: "/music/makencat-ambient-firstday.mp3",
      cover: "/music/covers/default-cover.jpg" 
    },
    { 
      id: "3", 
      name: "Dance Cap 1", 
      artist: "MakenCat", 
      path: "/music/makencat-dancecap-1.mp3",
      cover: "/music/covers/cappie.jpg"
    },
    { 
      id: "4", 
      name: "Dance Cap 2", 
      artist: "MakenCat", 
      path: "/music/makencat-dancecap-2.mp3",
      cover: "/music/covers/cappie.jpg"
    },
    { 
      id: "5", 
      name: "Real Life", 
      artist: "MakenCat", 
      path: "/music/makencat-ambient-reallife.mp3",
      cover: "/music/covers/default-cover.jpg"
    },    
  ];

  useEffect(() => {
    // Initialize audio element
    const audio = new Audio();
    audio.volume = volume / 100;
    audio.loop = isLooping;
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
    if (!isLooping) {
      nextSong();
    }
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
    let nextIndex: number;
    
    if (isShuffle) {
      // Generate random index different from current
      do {
        nextIndex = Math.floor(Math.random() * songs.length);
      } while (nextIndex === currentIndex && songs.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % songs.length;
    }
    
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

  // Toggle loop mode
  const toggleLoop = () => {
    if (!audioRef.current) return;
    
    const newLoopingState = !isLooping;
    audioRef.current.loop = newLoopingState;
    setIsLooping(newLoopingState);
  };

  // Toggle shuffle mode
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  return (
    <div className={`h-full bg-[#1a1b26] text-gray-300 p-4 flex flex-col ${className} relative`}>
      {/* Info button */}
      <button 
        onClick={() => setShowInfo(!showInfo)}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10"
        title="Song information"
      >
        <Info className="w-5 h-5" />
      </button>
      
      {/* Info modal */}
      {showInfo && (
        <div className="absolute inset-0 bg-black bg-opacity-80 z-20 flex items-center justify-center p-4">
          <div className="bg-[#1e1e2e] rounded-lg p-4 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Music Information</h3>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-300 mb-4">
              <p className="mb-2">
                Currently playing: <span className="text-white">{currentSong?.name || "None"}</span>
              </p>
              <p className="mb-2">
                Artist: <span className="text-white">{currentSong?.artist || "Unknown"}</span>
              </p>
              <p className="mb-4">
                Music by <a href="https://soundcloud.com/makencat" className="text-blue-400 hover:underline">MakenCat</a>
              </p>
              <div className="bg-gray-800 bg-opacity-50 p-2 rounded-md text-xs">
                <p className="mb-1">All music used with permission from the artist.</p>
                <p className="mb-1">If you believe your copyrighted work has been used without permission, please contact us with the required information.</p>
                <p>Send DMCA notices to: [contact email]</p>
              </div>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
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
      
      {/* Credits and DMCA notice */}
      <div className="text-xs text-gray-500 mb-4 text-center">
        <p className="mb-1">
          Music by <a href="https://soundcloud.com/makencat" className="text-blue-400 hover:underline">MakenCat</a>
        </p>
        <details className="text-left cursor-pointer">
          <summary className="text-gray-500 hover:text-gray-400 transition">DMCA/Copyright Info</summary>
          <div className="p-2 text-[10px] bg-gray-800 bg-opacity-50 mt-2 rounded-md">
            <p className="mb-1">All music used with permission from the artist.</p>
            <p className="mb-1">If you believe your copyrighted work has been used without permission, please contact us with:</p>
            <ul className="list-disc list-inside ml-2 mb-1">
              <li>Identification of the copyrighted work</li>
              <li>Location of the material on our site</li>
              <li>Your contact information</li>
              <li>Statement of good faith belief</li>
              <li>Statement of accuracy under penalty of perjury</li>
            </ul>
            <p>Send DMCA notices to: [contact email]</p>
          </div>
        </details>
      </div>
      
      {/* Playback controls */}
      <div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs">{formatTime(progress)}</span>
          <div className="flex-grow h-3 flex items-center group">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={seekTrack}
              className="w-full h-1.5 appearance-none bg-gray-700 rounded-lg overflow-hidden cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-blue-900/30
                [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-none
                hover:h-2 transition-all duration-150
                relative before:absolute before:content-[''] before:h-full before:left-0 before:top-0
                before:bg-gradient-to-r before:from-blue-500 before:to-blue-600 before:rounded-l-lg"
              style={{ 
                backgroundImage: `linear-gradient(to right, #3b82f6 ${(progress / (duration || 1)) * 100}%, transparent ${(progress / (duration || 1)) * 100}%)` 
              } as React.CSSProperties}
            />
          </div>
          <span className="text-xs">{formatTime(duration)}</span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button 
            onClick={prevSong} 
            className="text-gray-300 hover:text-white transition-colors"
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
            className="text-gray-300 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
        
        {/* Additional controls and Volume */}
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={toggleLoop}
            className={`relative p-1.5 rounded-full transition-colors ${isLooping ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            title="Loop track"
          >
            {isLooping && <span className="absolute inset-0 bg-blue-500 bg-opacity-25 rounded-full"></span>}
            <Repeat className="w-4 h-4 relative z-10" />
          </button>
          
          <button 
            onClick={toggleShuffle}
            className={`relative p-1.5 rounded-full transition-colors ${isShuffle ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            title="Shuffle tracks"
          >
            {isShuffle && <span className="absolute inset-0 bg-blue-500 bg-opacity-25 rounded-full"></span>}
            <Shuffle className="w-4 h-4 relative z-10" />
          </button>
          
          <div 
            className="flex-grow flex items-center gap-2"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button 
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            <div className={`flex-grow h-5 flex items-center transition-all duration-200 ${showVolumeSlider ? 'opacity-100 w-full' : 'opacity-50 w-8 md:w-16'}`}>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={changeVolume}
                className="w-full h-1.5 appearance-none bg-gray-700 rounded-lg cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-blue-900/30
                  [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-none
                  relative before:absolute before:content-[''] before:h-1.5 before:left-0 before:top-0
                  before:bg-gradient-to-r before:from-blue-500 before:to-blue-600 before:rounded-l-lg before:max-w-full"
                style={{ 
                  backgroundImage: `linear-gradient(to right, #3b82f6 ${volume}%, transparent ${volume}%)` 
                } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden audio element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default MusicPlayer;