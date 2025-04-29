'use client';

import React from 'react';
import { ClickableElement } from '../common/ClickableElement';

interface TerminalLinkProps {
  onClick?: (event: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
  command?: string;
  href?: string;
  external?: boolean;
}

/**
 * A link component for terminal commands with sound effects
 */
export const TerminalLink: React.FC<TerminalLinkProps> = ({
  onClick,
  children,
  className = '',
  command,
  href,
  external = false,
  ...rest
}) => {
  const baseClasses = 'text-blue-400 hover:text-blue-300 hover:underline cursor-pointer';
  const linkClasses = `${baseClasses} ${className}`;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    } else if (href) {
      if (external) {
        window.open(href, '_blank');
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <ClickableElement
      as="span"
      className={linkClasses}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </ClickableElement>
  );
};