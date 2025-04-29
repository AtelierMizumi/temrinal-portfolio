'use client';

import React from 'react';
import { useTerminalSounds } from '@/hooks/useTerminalSounds';

interface ClickableElementProps {
  onClick?: (event: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  soundType?: 'click' | 'toggle';
  disabled?: boolean;
  [key: string]: any; // for other props
}

/**
 * A wrapper component that adds sound effects to clickable elements
 */
export const ClickableElement: React.FC<ClickableElementProps> = ({
  onClick,
  children,
  className = '',
  as: Component = 'div',
  soundType = 'click',
  disabled = false,
  ...rest
}) => {
  const { playSound } = useTerminalSounds();

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled) {
      playSound(soundType);
      onClick?.(e);
    }
  };

  return (
    <Component 
      className={className} 
      onClick={handleClick}
      {...rest}
    >
      {children}
    </Component>
  );
};

/**
 * Button version of ClickableElement
 */
export const ClickableButton: React.FC<Omit<ClickableElementProps, 'as'>> = (props) => {
  return <ClickableElement as="button" {...props} />;
};