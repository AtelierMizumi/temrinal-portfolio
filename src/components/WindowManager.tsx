"use client";

import type React from "react";
import { type ReactNode, useCallback, useState } from "react"
import { Rnd } from "react-rnd";

export interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClick?: () => void;
  className?: string;
  zIndex?: number;
}

export const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  initialWidth = 600,
  initialHeight = 400,
  initialX = 50,
  initialY = 50,
  minWidth = 250,
  minHeight = 200,
  resizable = true,
  onClose,
  onMinimize,
  onMaximize,
  onClick,
  className = "",
  zIndex = 1,
}) => {
  const [maximized, setMaximized] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
    x: initialX,
    y: initialY,
  });
  const [prevDimensions, setPrevDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
    x: initialX,
    y: initialY,
  });

  const handleMaximize = useCallback(() => {
    if (maximized) {
      // Restore to previous dimensions
      setDimensions(prevDimensions);
    } else {
      // Save current dimensions and maximize
      setPrevDimensions(dimensions);
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 48, // Account for taskbar
        x: 0,
        y: 0,
      });
    }
    setMaximized(!maximized);
    if (onMaximize) onMaximize();
  }, [maximized, dimensions, prevDimensions, onMaximize]);

  const handleClick = useCallback(() => {
    if (onClick) onClick();
  }, [onClick]);

  return (
    <Rnd
      style={{ zIndex }}
      size={{ width: dimensions.width, height: dimensions.height }}
      position={{ x: dimensions.x, y: dimensions.y }}
      onDragStop={(e, d) => {
        setDimensions({ ...dimensions, x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setDimensions({
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          x: position.x,
          y: position.y,
        });
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      disableDragging={maximized}
      enableResizing={resizable && !maximized}
      dragHandleClassName="window-header"
      bounds=".desktop"
      default={{
        x: initialX,
        y: initialY,
        width: initialWidth,
        height: initialHeight,
      }}
      className={`window ${className} ${maximized ? "maximized" : ""}`}
      onClick={handleClick}
    >
      <div className="window-header">
        <div className="window-title">{title}</div>
        <div className="window-controls">
          {onMinimize && (
            <div
              className="window-control minimize"
              onClick={onMinimize}
              title="Minimize"
            />
          )}
          {resizable && (
            <div
              className="window-control maximize"
              onClick={handleMaximize}
              title={maximized ? "Restore" : "Maximize"}
            />
          )}
          {onClose && (
            <div
              className="window-control close"
              onClick={onClose}
              title="Close"
            />
          )}
        </div>
      </div>
      <div className="window-content">
        {children}
      </div>
    </Rnd>
  );
};

export interface WindowManagerProps {
  children?: ReactNode;
}

export const WindowManager: React.FC<WindowManagerProps> = ({ children }) => {
  return (
    <div className="desktop">
      {children}
      <div className="taskbar">
        {/* Taskbar content can be added here */}
      </div>
    </div>
  );
};

export default WindowManager;
