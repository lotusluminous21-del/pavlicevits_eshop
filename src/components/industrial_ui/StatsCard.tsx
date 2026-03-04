import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  variant?: 'default' | 'accent' | 'muted';
  onClick?: () => void;
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  onClick,
  className,
}: StatsCardProps) {
  const labelColors = {
    default: 'text-destructive',
    accent: 'text-accent',
    muted: 'text-muted-foreground',
  };

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-6',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      onClick={onClick}
    >
      {/* Label */}
      <p
        className={cn(
          'text-xs font-semibold uppercase tracking-wide',
          labelColors[variant]
        )}
      >
        {label}
      </p>

      {/* Value */}
      <p className="mt-2 text-3xl font-bold text-foreground">
        {value}
      </p>

      {/* Icon or Trend */}
      <div className="mt-3 flex items-center justify-between">
        {icon && (
          <div className="text-primary">
            {icon}
          </div>
        )}
        
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.direction === 'up' ? 'text-success' : 'text-destructive'
            )}
          >
            <svg
              className={cn(
                'w-4 h-4',
                trend.direction === 'down' && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17l5-5 5 5M7 7l5 5 5-5"
              />
            </svg>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
