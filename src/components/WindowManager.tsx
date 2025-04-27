"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWobbleEffect } from "./window-wobble-provider";
import { animate } from "animejs";
import { format } from 'date-fns';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  zIndex: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  className?: string;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  onClose?: () => void;
  onFocus?: () => void;
  showDate?: boolean; // New prop to control date display
}

export const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  zIndex,
  initialX,
  initialY,
  initialWidth,
  initialHeight,
  className = "",
  resizable = true,
  minimizable = true,
  maximizable = true,
  onClose,
  onFocus,
  showDate = false, // Default to false
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [wobbleTransform, setWobbleTransform] = useState("");
  const windowRef = useRef<HTMLDivElement>(null);
  const resizeStartPosition = useRef({ x: 0, y: 0 });
  const dragStartPosition = useRef({ x: 0, y: 0, windowX: 0, windowY: 0 });
  const preMaximizedState = useRef({
    position: { x: initialX, y: initialY },
    size: { width: initialWidth, height: initialHeight },
  });
  const [currentDate, setCurrentDate] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Access the wobble context
  const { wobbleEnabled } = useWobbleEffect();

  // Effect for window wobble
  useEffect(() => {
    if (!wobbleEnabled || !windowRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging || isResizing) return; // No wobble during drag/resize
      if (!windowRef.current) return;

      const rect = windowRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from mouse to window center
      const distX = (e.clientX - centerX) / (window.innerWidth / 2);
      const distY = (e.clientY - centerY) / (window.innerHeight / 2);
      
      // Calculate wobble effect (stronger when closer to the window)
      const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
      const windowSize = Math.sqrt(Math.pow(rect.width, 2) + Math.pow(rect.height, 2));
      const maxDist = windowSize * 1.5;
      const factor = Math.max(0, 1 - distance / maxDist);
      
      // Apply rotation and perspective transform
      const rotateY = distX * 2 * factor;
      const rotateX = -distY * 2 * factor;
      const transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      setWobbleTransform(transform);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [wobbleEnabled, isDragging, isResizing]);

  // Reset wobble when disabled
  useEffect(() => {
    if (!wobbleEnabled) {
      setWobbleTransform("");
    }
  }, [wobbleEnabled]);

  // Set up current date for display
  useEffect(() => {
    if (showDate) {
      const updateDate = () => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        };
        setCurrentDate(now.toLocaleDateString('en-US', options));
      };
      
      updateDate();
      const timer = setInterval(updateDate, 60000); // Update every minute
      
      return () => clearInterval(timer);
    }
  }, [showDate]);

  const handleMouseDown = (e: React.MouseEvent, action: "drag" | "resize") => {
    if (action === "drag") {
      setIsDragging(true);
      dragStartPosition.current = {
        x: e.clientX,
        y: e.clientY,
        windowX: position.x,
        windowY: position.y,
      };
    } else if (action === "resize" && resizable) {
      setIsResizing(true);
      resizeStartPosition.current = {
        x: e.clientX,
        y: e.clientY,
      };
    }
    
    if (onFocus) onFocus();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      // Calculate new position
      const deltaX = e.clientX - dragStartPosition.current.x;
      const deltaY = e.clientY - dragStartPosition.current.y;
      const newX = dragStartPosition.current.windowX + deltaX;
      const newY = dragStartPosition.current.windowY + deltaY;
      
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      // Calculate new size
      const deltaX = e.clientX - resizeStartPosition.current.x;
      const deltaY = e.clientY - resizeStartPosition.current.y;
      
      setSize({
        width: Math.max(200, size.width + deltaX),
        height: Math.max(100, size.height + deltaY),
      });
      
      resizeStartPosition.current = {
        x: e.clientX,
        y: e.clientY,
      };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  const handleMaximize = () => {
    if (maximized) {
      setPosition(preMaximizedState.current.position);
      setSize(preMaximizedState.current.size);
    } else {
      preMaximizedState.current = {
        position: { ...position },
        size: { ...size },
      };
      setPosition({ x: 0, y: 0 });
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    setMaximized(!maximized);
  };

  // Enhanced open animation using anime.js
  useEffect(() => {
    if (windowRef.current) {
      animate(windowRef.current, {
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
      
      // Adjust position if window would overlap with topbar
      if (position.y < 48) { // 48px accounts for topbar height + some padding
        setPosition({
          ...position,
          y: Math.max(48, position.y)
        });
      }
    }
  }, []);
  
  // Enhanced maximize/restore animation
  useEffect(() => {
    if (windowRef.current) {
      animate(windowRef.current, {
        width: size.width,
        height: size.height,
        left: position.x,
        top: position.y,
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  }, [size.width, size.height, position.x, position.y]);

  return (
    <div
      id={id}
      ref={windowRef}
      className={`window absolute shadow-lg overflow-hidden ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex,
        transform: wobbleEnabled ? wobbleTransform : "",
        transition: wobbleEnabled ? "transform 0.05s ease" : "none",
        borderRadius: "0.75rem",
        backgroundColor: "rgba(35, 38, 52, 0.9)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(81, 87, 109, 0.4)",
      }}
      onMouseDown={() => onFocus && onFocus()}
    >
      {/* macOS style titlebar */}
      <div
        className="window-header h-8 flex items-center justify-between px-3 cursor-move"
        style={{
          backgroundColor: "rgba(41, 44, 60, 0.9)",
          borderTopLeftRadius: "0.75rem",
          borderTopRightRadius: "0.75rem",
        }}
        onMouseDown={(e) => handleMouseDown(e, "drag")}
      >
        {/* Traffic light controls */}
        <div className="window-controls flex gap-1.5 items-center">
          {onClose && (
            <div
              className="window-control close h-3 w-3 rounded-full bg-red hover:brightness-90 flex items-center justify-center group"
              onClick={(e) => {
                e.stopPropagation();
                if (windowRef.current) {
                  // Close animation
                  animate(windowRef.current, {
                    opacity: [1, 0],
                    scale: [1, 0.9],
                    duration: 200,
                    easing: 'easeOutQuad',
                    complete: onClose
                  });
                } else {
                  onClose();
                }
              }}
              title="Close"
            >
              <span className="icon opacity-0 group-hover:opacity-100 text-black text-[8px]">×</span>
            </div>
          )}
          
          {minimizable && (
            <div
              className="window-control minimize h-3 w-3 rounded-full bg-yellow hover:brightness-90 flex items-center justify-center group"
              onClick={(e) => {
                e.stopPropagation();
                // Handle minimize with animation
                if (windowRef.current) {
                  animate(windowRef.current, {
                    translateY: [0, 20],
                    opacity: [1, 0],
                    duration: 300,
                    easing: 'easeOutQuad'
                  });
                }
              }}
              title="Minimize"
            >
              <span className="icon opacity-0 group-hover:opacity-100 text-black text-[8px]">-</span>
            </div>
          )}
          
          {maximizable && resizable && (
            <div
              className="window-control maximize h-3 w-3 rounded-full bg-green hover:brightness-90 flex items-center justify-center group"
              onClick={(e) => {
                e.stopPropagation();
                handleMaximize();
              }}
              title={maximized ? "Restore" : "Maximize"}
            >
              <span className="icon opacity-0 group-hover:opacity-100 text-black text-[8px]">□</span>
            </div>
          )}
        </div>
        
        {/* Centered title with optional date */}
        <div className="window-title text-text text-sm font-medium absolute left-1/2 transform -translate-x-1/2 select-none flex flex-col items-center">
          <span>{title}</span>
          {showDate && (
            <span className="text-xs text-text/70">{currentDate}</span>
          )}
        </div>
        
        {/* Spacer for right side */}
        <div className="w-14"></div>
      </div>

      <div 
        ref={contentRef}
        className="window-content"
        style={{
          height: "calc(100% - 32px)",
          borderBottomLeftRadius: "0.75rem",
          borderBottomRightRadius: "0.75rem",
          overflow: "hidden" // Ensure content doesn't overflow
        }}
      >
        {children}
      </div>

      {/* Resize handle for non-maximized windows */}
      {resizable && !maximized && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
          style={{
            backgroundImage: 'linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.3) 50%)',
          }}
        />
      )}
    </div>
  );
};

export const WindowManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="window-manager">{children}</div>;
};
