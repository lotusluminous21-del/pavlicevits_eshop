import React from 'react';
import { cn } from '@/lib/utils';

export interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor?: 'primary' | 'accent' | 'muted';
  onClick?: () => void;
  className?: string;
}

export function ServiceCard({
  icon,
  title,
  description,
  iconColor = 'primary',
  onClick,
  className,
}: ServiceCardProps) {
  const iconColors = {
    primary: 'text-primary',
    accent: 'text-accent',
    muted: 'text-muted-foreground',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 flex items-center justify-center mb-4',
          iconColors[iconColor]
        )}
      >
        {icon}
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-foreground uppercase tracking-wide mb-2 group-hover:text-accent transition-colors">
        {title}
      </h4>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default ServiceCard;
