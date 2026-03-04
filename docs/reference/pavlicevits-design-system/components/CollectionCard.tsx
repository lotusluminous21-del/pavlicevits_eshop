import React from 'react';
import { cn } from '@/lib/utils';

export interface CollectionCardProps {
  title: string;
  description: string;
  image: string;
  badge?: string;
  variant?: 'default' | 'featured';
  onClick?: () => void;
  className?: string;
}

export function CollectionCard({
  title,
  description,
  image,
  badge,
  variant = 'default',
  onClick,
  className,
}: CollectionCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-lg',
        onClick && 'cursor-pointer',
        variant === 'featured' ? 'aspect-[4/5]' : 'aspect-square',
        className
      )}
    >
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Badge */}
      {badge && (
        <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-wide rounded-sm">
          {badge}
        </span>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-sm text-white/80 mt-1 line-clamp-2">
          {description}
        </p>

        {/* Pagination dots (decorative) */}
        <div className="flex gap-1.5 mt-3">
          <div className="w-2 h-2 rounded-full bg-white" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}

export default CollectionCard;
