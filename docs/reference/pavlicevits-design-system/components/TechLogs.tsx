import React from 'react';
import { cn } from '@/lib/utils';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'AI' | 'USER' | 'SYSTEM';
  message: string;
}

export interface TechLogsProps {
  title?: string;
  logs: LogEntry[];
  maxHeight?: number;
  className?: string;
}

export function TechLogs({
  title = 'Technical Logs',
  logs,
  maxHeight = 200,
  className,
}: TechLogsProps) {
  const typeColors = {
    AI: 'text-accent',
    USER: 'text-info',
    SYSTEM: 'text-muted-foreground',
  };

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <h4 className="text-xs font-semibold text-destructive uppercase tracking-wide mb-3">
        {title}
      </h4>

      {/* Log Container */}
      <div
        className="font-mono text-xs space-y-1 overflow-y-auto custom-scrollbar"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-muted-foreground flex-shrink-0">
              [{log.timestamp}]
            </span>
            <span className={cn('flex-shrink-0', typeColors[log.type])}>
              {log.type}:
            </span>
            <span className="text-muted-foreground">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TechLogs;
