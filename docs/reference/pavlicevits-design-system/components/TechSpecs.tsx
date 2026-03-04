import React from 'react';
import { cn } from '@/lib/utils';

export interface SpecItem {
  label: string;
  value: string;
}

export interface TechSpecsProps {
  title?: string;
  specs: SpecItem[];
  columns?: 1 | 2;
  className?: string;
}

export function TechSpecs({
  title = 'Technical Specifications',
  specs,
  columns = 2,
  className,
}: TechSpecsProps) {
  return (
    <div className={cn('', className)}>
      {/* Header */}
      <h3 className="text-2xl font-bold text-foreground uppercase tracking-tight mb-6">
        <span className="block">Technical</span>
        <span className="block">Specifications</span>
      </h3>

      {/* Specs Grid */}
      <div
        className={cn(
          'grid gap-x-8 gap-y-4',
          columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
        )}
      >
        {specs.map((spec, index) => (
          <div
            key={index}
            className="flex justify-between items-baseline py-2 border-b border-border"
          >
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {spec.label}
            </span>
            <span className="text-sm font-semibold text-foreground text-right">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TechSpecs;
