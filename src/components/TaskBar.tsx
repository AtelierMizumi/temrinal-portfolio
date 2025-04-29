import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { ClickableButton, ClickableElement } from './common/ClickableElement';

interface TaskBarProps {
  onArchClick: () => void;
  extraButtons?: React.ReactNode;
}

export const TaskBar: React.FC<TaskBarProps> = ({ onArchClick, extraButtons }) => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const taskbarRef = useRef<HTMLDivElement>(null);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Initial animation
  useEffect(() => {
    if (taskbarRef.current) {
      animate(taskbarRef.current, {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutQuad',
        delay: 300
      });
    }
  }, []);

  return (
    <div 
      ref={taskbarRef}
      className="taskbar w-full h-12 fixed bottom-0 flex items-center justify-between px-4 z-50"
    >
      <div className="left flex items-center gap-4">
        <ClickableButton 
          className="arch-icon w-8 h-8 rounded-full overflow-hidden hover:scale-110 transition"
          onClick={onArchClick}
        >
          <img 
            src="/arch.svg" 
            alt="Arch" 
            className="w-full h-full object-contain filter brightness-110"
          />
        </ClickableButton>
        
        <ClickableButton 
          className="taskbar-button"
          onClick={(e) => {
            animate(e.currentTarget, {
              scale: [1, 1.2, 1],
              duration: 300,
              easing: 'easeInOutQuad'
            });
          }}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M19.5 9L12 16.5L4.5 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ClickableButton>
      </div>

      <div className="center flex items-center gap-2">
        {extraButtons}
      </div>

      <div 
        className="time text-text text-sm"
        onClick={(e) => {
          animate(e.currentTarget, {
            scale: [1, 1.1, 1],
            duration: 300,
            easing: 'easeInOutQuad'
          });
        }}
      >
        {currentTime}
      </div>
    </div>
  );
};