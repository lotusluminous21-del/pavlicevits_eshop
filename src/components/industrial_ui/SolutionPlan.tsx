import React from 'react';
import { cn } from '@/lib/utils';

export interface Phase {
  id: string;
  number: number;
  title: string;
  description: string;
  features?: string[];
  note?: {
    label: string;
    content: string;
  };
  tags?: string[];
}

export interface ProjectSummary {
  surfaceType: string;
  totalArea: string;
  atmosphere: string;
  primaryGoal: string;
  estimatedDuration: string;
}

export interface SafetyProtocol {
  title: string;
  items: string[];
}

export interface SolutionPlanProps {
  title?: string;
  subtitle?: string;
  summary: ProjectSummary;
  phases: Phase[];
  safety?: SafetyProtocol;
  onExportPDF?: () => void;
  onShare?: () => void;
  className?: string;
}

export function SolutionPlan({
  title = 'Industrial Solution Plan',
  subtitle,
  summary,
  phases,
  safety,
  onExportPDF,
  onShare,
  className,
}: SolutionPlanProps) {
  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full mb-4">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
          </svg>
          AI Generated Strategy
        </span>
        
        <h1 className="text-4xl font-extrabold text-foreground uppercase tracking-tight leading-none">
          Industrial<br />Solution Plan
        </h1>
        
        {subtitle && (
          <p className="mt-4 text-muted-foreground max-w-xl">{subtitle}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-light transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PDF
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground text-sm font-medium rounded-md hover:bg-secondary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Summary & Safety */}
        <div className="space-y-6">
          {/* Project Summary */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Project Summary
              </h3>
            </div>
            
            <div className="space-y-3">
              {[
                { label: 'Surface Type', value: summary.surfaceType },
                { label: 'Total Area', value: summary.totalArea },
                { label: 'Atmosphere', value: summary.atmosphere },
                { label: 'Primary Goal', value: summary.primaryGoal },
                { label: 'Est. Duration', value: summary.estimatedDuration },
              ].map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Protocol */}
          {safety && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-sm font-semibold text-accent uppercase tracking-wide">
                  {safety.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {safety.items.join(' ')}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Phases */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Step-by-Step Guideline
              </h3>
              <span className="text-xs font-medium text-muted-foreground">
                {phases.length} Phases
              </span>
            </div>

            <div className="space-y-8">
              {phases.map((phase) => (
                <div key={phase.id} className="flex gap-4">
                  {/* Phase Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {phase.number}
                  </div>

                  {/* Phase Content */}
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-foreground uppercase tracking-wide">
                      Phase {phase.number}: {phase.title}
                    </h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {phase.description}
                    </p>

                    {/* Features */}
                    {phase.features && phase.features.length > 0 && (
                      <div className="flex flex-wrap gap-4 mt-3">
                        {phase.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-accent">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tech Note */}
                    {phase.note && (
                      <div className="mt-3 p-3 bg-secondary rounded-md">
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                          {phase.note.label}
                        </span>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {phase.note.content}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {phase.tags && phase.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {phase.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-xs font-medium border border-border rounded-md text-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SolutionPlan;
