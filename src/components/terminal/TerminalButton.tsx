'use client';

import React from 'react';
import { ClickableButton } from '../common/ClickableElement';

interface TerminalButtonProps {
  onClick?: (event: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

/**
 * A button component specifically for terminal with sound effects
 */
export const TerminalButton: React.FC<TerminalButtonProps> = ({
  onClick,
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...rest
}) => {
  // Base styles
  const baseStyles = 'rounded focus:outline-none transition-all';
  
  // Size variants
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // Color variants
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  
  // Disabled state
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  const buttonClasses = `${baseStyles} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`;

  return (
    <ClickableButton
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </ClickableButton>
  );
};