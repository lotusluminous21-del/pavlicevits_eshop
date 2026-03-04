import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ChatMessageProps {
  variant: 'assistant' | 'user';
  senderName?: string;
  content: ReactNode;
  timestamp?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  className?: string;
}

export function ChatMessage({
  variant,
  senderName,
  content,
  timestamp,
  actions,
  className,
}: ChatMessageProps) {
  const isAssistant = variant === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-3',
        !isAssistant && 'flex-row-reverse',
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          isAssistant ? 'bg-primary' : 'bg-secondary'
        )}
      >
        {isAssistant ? (
          <svg
            className="w-5 h-5 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[80%]', !isAssistant && 'items-end')}>
        {/* Sender Name */}
        {senderName && (
          <span
            className={cn(
              'text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1',
              !isAssistant && 'text-right'
            )}
          >
            {senderName}
          </span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'rounded-lg px-4 py-3',
            isAssistant
              ? 'bg-card border border-border text-foreground'
              : 'bg-primary text-primary-foreground'
          )}
        >
          <div className="text-sm leading-relaxed">{content}</div>
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={cn(
                  'px-4 py-2 text-sm font-medium',
                  'bg-card border border-border rounded-md',
                  'hover:bg-secondary transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
