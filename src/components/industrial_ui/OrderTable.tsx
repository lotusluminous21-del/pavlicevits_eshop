import React from 'react';
import { cn } from '@/lib/utils';
import { StatusBadge, StatusType } from './StatusBadge';

export interface Order {
  id: string;
  reference: string;
  date: string;
  projectName: string;
  status: StatusType;
  volume?: string;
  value: number;
}

export interface OrderTableProps {
  orders: Order[];
  onRowClick?: (order: Order) => void;
  showArchiveLink?: boolean;
  onArchiveClick?: () => void;
  className?: string;
}

export function OrderTable({
  orders,
  onRowClick,
  showArchiveLink = true,
  onArchiveClick,
  className,
}: OrderTableProps) {
  return (
    <div className={cn('bg-card border border-border rounded-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">
          Recent Orders
        </h3>
        {showArchiveLink && (
          <button
            onClick={onArchiveClick}
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
          >
            View Archive
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-xs font-semibold text-destructive uppercase tracking-wide">
                Order Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Volume
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onRowClick?.(order)}
                className={cn(
                  'border-b border-border last:border-b-0',
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-muted/50'
                )}
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {order.reference}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {order.date}
                </td>
                <td className="px-6 py-4 text-sm text-accent font-medium">
                  {order.projectName}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} size="sm" />
                </td>
                <td className="px-6 py-4 text-sm text-accent">
                  {order.volume || '-'}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-foreground text-right">
                  ${order.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderTable;
