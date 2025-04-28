"use client";

import { useState, useEffect } from 'react';
import { X, Check, Play } from 'lucide-react';

interface BackgroundSelectorProps {
  backgrounds: string[];
  currentBackground: string;
  onSelect: (background: string) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ 
  backgrounds,
  currentBackground,
  onSelect 
}) => {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [videoRefs, setVideoRefs] = useState<{[key: string]: HTMLVideoElement | null}>({});

  // Play video on hover
  const handleMouseEnter = (bgPath: string) => {
    if (bgPath.endsWith('.mp4') || bgPath.endsWith('.webm')) {
      setHoveredVideo(bgPath);
      if (videoRefs[bgPath]) {
        videoRefs[bgPath]?.play().catch(err => console.error("Video play error:", err));
      }
    }
  };
  
  // Pause video when not hovering
  const handleMouseLeave = (bgPath: string) => {
    if (bgPath.endsWith('.mp4') || bgPath.endsWith('.webm')) {
      setHoveredVideo(null);
      if (videoRefs[bgPath]) {
        videoRefs[bgPath]?.pause();
      }
    }
  };

  // Register video element ref
  const registerVideoRef = (bgPath: string, element: HTMLVideoElement | null) => {
    if (element && !videoRefs[bgPath]) {
      setVideoRefs(prev => ({
        ...prev,
        [bgPath]: element
      }));
    }
  };

  // Play click sound
  const playClickSound = () => {
    const audio = new Audio('/sounds/click.mp3');
    audio.volume = 0.3;
    audio.play().catch(err => console.error('Error playing sound:', err));
  };

  // Group backgrounds by type
  const imageBackgrounds = backgrounds.filter(bg => !bg.endsWith('.mp4') && !bg.endsWith('.webm'));
  const videoBackgrounds = backgrounds.filter(bg => bg.endsWith('.mp4') || bg.endsWith('.webm'));

  return (
    <div className="h-full bg-[#1a1a1a] text-gray-200 overflow-y-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Background Gallery</h2>
      
      {/* Images section */}
      {imageBackgrounds.length > 0 && (
        <>
          <h3 className="text-md font-medium mb-2 text-gray-400">Images</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {imageBackgrounds.map((bg) => (
              <div 
                key={bg}
                className={`
                  relative rounded-md overflow-hidden cursor-pointer group
                  ${currentBackground === bg ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-400'}
                `}
                onClick={() => {
                  playClickSound();
                  onSelect(bg);
                }}
                onMouseEnter={() => handleMouseEnter(bg)}
                onMouseLeave={() => handleMouseLeave(bg)}
              >
                <div 
                  className="w-full h-24 bg-cover bg-center"
                  style={{ backgroundImage: `url('${bg}')` }}
                />
                
                {/* Selected indicator */}
                {currentBackground === bg && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {currentBackground !== bg && "Select"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Videos section */}
      {videoBackgrounds.length > 0 && (
        <>
          <h3 className="text-md font-medium mb-2 text-gray-400">Videos</h3>
          <div className="grid grid-cols-2 gap-3">
            {videoBackgrounds.map((bg) => (
              <div 
                key={bg}
                className={`
                  relative rounded-md overflow-hidden cursor-pointer group
                  ${currentBackground === bg ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-400'}
                `}
                onClick={() => {
                  playClickSound();
                  onSelect(bg);
                }}
                onMouseEnter={() => handleMouseEnter(bg)}
                onMouseLeave={() => handleMouseLeave(bg)}
              >
                <video
                  ref={(el) => registerVideoRef(bg, el)}
                  className="w-full h-24 object-cover"
                  src={bg}
                  muted
                  loop
                />
                
                {/* Play button overlay when not hovering */}
                {hoveredVideo !== bg && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white opacity-70" />
                  </div>
                )}
                
                {/* Selected indicator */}
                {currentBackground === bg && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BackgroundSelector;