import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

interface TaskBarProps {
  onArchClick: () => void;
}

export const TaskBar: React.FC<TaskBarProps> = ({ onArchClick }) => {
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
      className="taskbar absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-3 z-10"
      style={{
        backgroundColor: "rgba(20, 22, 30, 0.7)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(81, 87, 109, 0.3)",
      }}
    >
      <div className="flex items-center">
        <button 
          className="arch-button w-8 h-8 rounded-full flex items-center justify-center mr-2 transition-all"
          onClick={() => {
            onArchClick();
          }}
          style={{
            backgroundColor: "rgba(41, 98, 255, 0.9)",
            boxShadow: "0 0 10px rgba(41, 98, 255, 0.5)",
          }}
        >
          <svg
            width="16"
            height="16"
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
        </button>
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