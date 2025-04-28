"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X } from 'lucide-react';

// Catppuccin Frappe color palette
const colorOptions = [
  { name: 'Rosewater', value: '#f2d5cf', hsl: 'hsl(10, 57%, 88%)' },
  { name: 'Flamingo', value: '#eebebe', hsl: 'hsl(0, 59%, 84%)' },
  { name: 'Pink', value: '#f4b8e4', hsl: 'hsl(316, 73%, 84%)' },
  { name: 'Mauve', value: '#ca9ee6', hsl: 'hsl(277, 59%, 76%)' }, // Default
  { name: 'Red', value: '#e78284', hsl: 'hsl(359, 68%, 71%)' },
  { name: 'Maroon', value: '#ea999c', hsl: 'hsl(358, 66%, 76%)' },
  { name: 'Peach', value: '#ef9f76', hsl: 'hsl(20, 79%, 70%)' },
  { name: 'Yellow', value: '#e5c890', hsl: 'hsl(40, 62%, 73%)' },
  { name: 'Green', value: '#a6d189', hsl: 'hsl(96, 44%, 68%)' },
  { name: 'Teal', value: '#81c8be', hsl: 'hsl(172, 39%, 65%)' },
  { name: 'Sky', value: '#99d1db', hsl: 'hsl(189, 48%, 73%)' },
  { name: 'Sapphire', value: '#85c1dc', hsl: 'hsl(199, 55%, 69%)' },
  { name: 'Blue', value: '#8caaee', hsl: 'hsl(222, 74%, 74%)' },
  { name: 'Lavender', value: '#babbf1', hsl: 'hsl(239, 66%, 84%)' },
];

interface ColorPaletteProps {
  onColorChange?: (colorHsl: string, colorName: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ onColorChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('Mauve');
  
  const handleColorSelect = (color: typeof colorOptions[0]) => {
    setSelectedColor(color.name);
    
    // Apply color wipe animation to root
    const root = document.documentElement;
    const animationOverlay = document.createElement('div');
    
    animationOverlay.style.position = 'fixed';
    animationOverlay.style.inset = '0';
    animationOverlay.style.background = color.value;
    animationOverlay.style.zIndex = '9999';
    animationOverlay.style.pointerEvents = 'none';
    animationOverlay.style.opacity = '0';
    
    document.body.appendChild(animationOverlay);
    
    // Animate the wipe effect
    requestAnimationFrame(() => {
      animationOverlay.style.transition = 'opacity 400ms ease-in-out';
      animationOverlay.style.opacity = '0.2';
      
      // Change the actual color before we fade out the overlay
      if (onColorChange) {
        onColorChange(color.hsl, color.name);
      }
      
      setTimeout(() => {
        // Fade out the overlay
        animationOverlay.style.opacity = '0';
        
        // Remove after animation completes
        setTimeout(() => {
          if (document.body.contains(animationOverlay)) {
            document.body.removeChild(animationOverlay);
          }
        }, 400);
      }, 300);
    });
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="color-palette-button bg-[#2a2a2a]/60 backdrop-blur-md flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#3a3a3a]/60 transition-colors"
        title="Change accent color"
      >
        <Palette className="w-4 h-4" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 right-0 w-72 bg-[#1a1a1a] rounded-lg shadow-xl border border-[#333] z-50 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-300 font-semibold">Accent Color</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.name}
                    onClick={() => handleColorSelect(color)}
                    className={`w-full aspect-square rounded-md relative overflow-hidden group ${selectedColor === color.name ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 text-xs text-gray-400 text-center">
                <p>Catppuccin Frappe Color Palette</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ColorPalette;