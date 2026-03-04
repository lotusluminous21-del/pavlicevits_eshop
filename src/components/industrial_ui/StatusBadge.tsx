import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'in-transit'
  | 'delivered'
  | 'pending'
  | 'processing'
  | 'cancelled'
  | 'new'
  | 'active'
  | 'inactive';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  'in-transit': {
    label: 'In Transit',
    className: 'bg-info/10 text-info border-info/30',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-success/10 text-success border-success/30',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  processing: {
    label: 'Processing',
    className: 'bg-accent/10 text-accent border-accent/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  new: {
    label: 'New',
    className: 'bg-accent text-accent-foreground border-transparent',
  },
  active: {
    label: 'Active',
    className: 'bg-success/10 text-success border-success/30',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-[11px]',
  lg: 'px-4 py-1.5 text-xs',
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold uppercase tracking-wide',
        'rounded border',
        config.className,
        sizeStyles[size],
        className
      )}
    >
      {displayLabel}
    </span>
  );
}

export default StatusBadge;
