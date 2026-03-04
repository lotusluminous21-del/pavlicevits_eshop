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
      <div
        className={cn(
          'w-12 h-12 flex items-center mb-4',
          iconColors[iconColor]
        )}
      >
        {icon}
      </div>

      <h4 className="text-sm font-bold uppercase tracking-wide mb-2 group-hover:text-accent transition-colors">
        {title}
      </h4>

      <p className="text-sm leading-relaxed opacity-80">
        {description}
      </p>
    </div>
  );
}

export default ServiceCard;
