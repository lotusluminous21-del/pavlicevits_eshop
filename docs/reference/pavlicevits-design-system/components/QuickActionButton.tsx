import React from 'react';
import { cn } from '@/lib/utils';

export interface QuickActionButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function QuickActionButton({
  children,
  variant = 'default',
  size = 'md',
  icon,
  onClick,
  disabled = false,
  className,
}: QuickActionButtonProps) {
  const variants = {
    default: 'bg-card border border-border hover:bg-secondary hover:border-foreground/20',
    outline: 'bg-transparent border border-border hover:bg-secondary',
    ghost: 'bg-transparent hover:bg-secondary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 font-medium rounded-md transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export default QuickActionButton;
