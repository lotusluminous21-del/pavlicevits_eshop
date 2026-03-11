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
  title = 'ΠΡΟΟΔΟΣ ΑΝΑΛΥΣΗΣ',
  subtitle,
  progress,
  steps,
  className,
}: ProjectProgressProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            {title}
          </h3>
          <span className="text-xs font-bold text-foreground bg-secondary px-2 py-0.5 rounded-full">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-secondary rounded-full overflow-hidden w-full">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps Timeline - Compact & Connected */}
      <div className="relative pl-2 space-y-4 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-secondary before:to-transparent">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex items-center justify-between">
            <div className="flex items-center gap-3 w-full">
              {/* Step Indicator */}
              <div
                className={cn(
                  'relative z-10 flex-shrink-0 w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ring-background',
                  step.status === 'completed' && 'bg-accent',
                  step.status === 'current' && 'bg-primary scale-125 animate-pulse',
                  step.status === 'pending' && 'bg-secondary'
                )}
              />

              {/* Step Label */}
              <span
                className={cn(
                  'text-sm transition-colors duration-300 flex-1',
                  step.status === 'completed' && 'text-foreground font-medium',
                  step.status === 'current' && 'text-foreground font-bold',
                  step.status === 'pending' && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
              
              {/* Optional Status Icon */}
               {step.status === 'completed' && (
                  <svg
                    className="w-3.5 h-3.5 text-accent flex-shrink-0"
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectProgress;
