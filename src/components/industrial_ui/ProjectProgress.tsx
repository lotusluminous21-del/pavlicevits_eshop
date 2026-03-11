import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  progress,
  steps,
  className,
}: ProjectProgressProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2">
            {title}
          </h3>
          <motion.span 
            initial={false}
            animate={{ opacity: 1 }}
            className="text-[11px] font-black tabular-nums text-accent bg-accent/10 px-2 py-0.5 rounded-full"
          >
            {progress}%
          </motion.span>
        </div>

        {/* Progress Bar - Slightly Thicker & Animated */}
        <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden w-full border border-border/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-accent shadow-[0_0_8px_rgba(var(--accent),0.4)]"
          />
        </div>
      </div>

      {/* Steps Timeline - More Premium Aesthetics */}
      <div className="relative pl-3 space-y-4">
        {/* Vertical Line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/50 via-border to-transparent" />
        
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => (
            <motion.div 
              key={step.id} 
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 w-full">
                {/* Step Indicator */}
                <div className="relative z-10 flex flex-shrink-0 items-center justify-center">
                  <motion.div
                    animate={step.status === 'current' ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] } : { scale: 1, opacity: 1 }}
                    transition={step.status === 'current' ? { duration: 2, repeat: Infinity } : undefined}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-500 ring-[4px] ring-background',
                      step.status === 'completed' && 'bg-accent ring-accent/10',
                      step.status === 'current' && 'bg-primary ring-primary/20',
                      step.status === 'pending' && 'bg-muted ring-transparent'
                    )}
                  />
                  {step.status === 'current' && (
                    <motion.div 
                      layoutId="active-glow"
                      className="absolute inset-0 rounded-full bg-primary/40 blur-sm -z-10" 
                    />
                  )}
                </div>

                {/* Step Label */}
                <div className="flex flex-col min-w-0">
                  <span
                    className={cn(
                      'text-xs transition-colors duration-300 truncate',
                      step.status === 'completed' && 'text-foreground font-medium',
                      step.status === 'current' && 'text-foreground font-bold',
                      step.status === 'pending' && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                
                {/* Status Icon */}
                {step.status === 'completed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
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
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ProjectProgress;
