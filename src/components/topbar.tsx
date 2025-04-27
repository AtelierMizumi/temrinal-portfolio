"use client";

import { useState, useEffect } from 'react';
import { ThemeToggle } from './theme-toggle';

export const Topbar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    
    // Update time immediately and set interval
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed top-0 left-0 right-0 h-7 bg-base/80 backdrop-blur-md flex items-center justify-between px-4 text-text z-50 font-mono text-sm shadow-md">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-mauve"></span>
          <span>portfolio</span>
        </div>
        
        <div className="flex space-x-4">
          <button className="hover:text-lavender transition-colors">File</button>
          <button className="hover:text-lavender transition-colors">Edit</button>
          <button className="hover:text-lavender transition-colors">View</button>
        </div>
      </div>
      
      {/* Center section */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div className="bg-surface0/60 px-3 py-0.5 rounded-md">
          {currentTime}
        </div>
      </div>
      
      {/* Right section */}
      <div className="flex items-center space-x-3">
        <div className="bg-surface0/60 px-2 py-0.5 rounded-md text-xs">
          {currentDate}
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green rounded-full"></div>
          <span>visitor</span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
};