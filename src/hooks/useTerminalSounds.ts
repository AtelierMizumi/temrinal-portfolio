'use client';

import { useEffect, useRef, useState } from 'react';

type SoundType = 'click' | 'toggle';

interface UseTerminalSoundsProps {
  enabled?: boolean;
  volume?: number;
}

/**
 * Hook to play terminal interaction sounds
 */
export const useTerminalSounds = ({ 
  enabled = true, 
  volume = 0.2 
}: UseTerminalSoundsProps = {}) => {
  const audioCache = useRef<Record<SoundType, HTMLAudioElement | null>>({
    click: null,
    toggle: null,
  });
  const [isReady, setIsReady] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    if (!enabled) return;
    
    // Only initialize in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      // Preload sounds
      audioCache.current = {
        click: new Audio('/sounds/click.mp3'),
        toggle: new Audio('/sounds/toggle.mp3'),
      };
      
      // Set volume for all sounds
      Object.values(audioCache.current).forEach(audio => {
        if (audio) {
          audio.volume = volume; // Configurable volume
          
          // Add event listeners to track loading
          audio.addEventListener('canplaythrough', () => {
            setIsReady(true);
          });
          
          // Preload audio
          audio.load();
        }
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }

    // Cleanup
    return () => {
      Object.values(audioCache.current).forEach(audio => {
        if (audio) {
          try {
            audio.pause();
            audio.currentTime = 0;
            audio.removeEventListener('canplaythrough', () => setIsReady(true));
          } catch (err) {
            console.debug('Error cleaning up audio:', err);
          }
        }
      });
    };
  }, [enabled, volume]);

  // Function to play a specific sound
  const playSound = (type: SoundType) => {
    if (!enabled || typeof window === 'undefined') return;
    
    try {
      const audio = audioCache.current[type];
      if (audio) {
        // Clone the audio element to allow overlapping sounds
        const soundClone = audio.cloneNode() as HTMLAudioElement;
        soundClone.volume = volume;
        
        // Play the sound
        const playPromise = soundClone.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            // Handle autoplay restrictions quietly
            console.debug('Could not play sound:', err.message);
          });
        }
      }
    } catch (err) {
      console.debug('Error playing sound:', err);
    }
  };

  return { playSound, isReady };
};