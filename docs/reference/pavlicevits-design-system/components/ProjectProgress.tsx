import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending';
}

export interface ProjectProgressProps {
  title?: string;
  subtitle?: string;
  progress: number; // 0-100
  steps: ProgressStep[];
  className?: string;
}

export function ProjectProgress({
  title = 'Project Progress',
  subtitle,
  progress,
  steps,
  className,
}: ProjectProgressProps) {
  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-xs font-semibold text-destructive uppercase tracking-wide">
            {title}
          </h4>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>

        {/* Title with Progress */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Analysis State</span>
          <span className="text-sm font-semibold text-foreground">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            {/* Step Indicator */}
            <div
              className={cn(
                'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                'border-2 transition-colors',
                step.status === 'completed' && 'bg-success border-success',
                step.status === 'current' && 'border-accent bg-accent',
                step.status === 'pending' && 'border-border bg-transparent'
              )}
            >
              {step.status === 'completed' && (
                <svg
                  className="w-3 h-3 text-success-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {step.status === 'current' && (
                <div className="w-2 h-2 bg-accent-foreground rounded-full" />
              )}
            </div>

            {/* Step Label */}
            <span
              className={cn(
                'text-sm',
                step.status === 'completed' && 'text-foreground',
                step.status === 'current' && 'text-foreground font-medium',
                step.status === 'pending' && 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectProgress;
