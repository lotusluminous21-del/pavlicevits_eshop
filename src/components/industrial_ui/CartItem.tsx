import React from 'react';
import { cn } from '@/lib/utils';

export interface CartItemProps {
  id: string;
  name: string;
  variant?: string;
  size?: string;
  price: number;
  quantity: number;
  image: string;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
  className?: string;
}

export function CartItem({
  id,
  name,
  variant,
  size,
  price,
  quantity,
  image,
  onQuantityChange,
  onRemove,
  className,
}: CartItemProps) {
  const handleIncrement = () => {
    onQuantityChange?.(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange?.(quantity - 1);
    }
  };

  return (
    <div
      className={cn(
        'flex gap-4 py-4 border-b border-border last:border-b-0',
        className
      )}
    >
      {/* Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-secondary rounded-lg overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{name}</h4>
            {(variant || size) && (
              <p className="text-sm text-accent mt-0.5">
                {[variant, size].filter(Boolean).join(' • ')}
              </p>
            )}
            <p className="text-sm font-semibold text-foreground mt-1">
              ${price.toFixed(2)}
            </p>
          </div>

          {/* Remove Button */}
          {onRemove && (
            <button
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              aria-label="Remove item"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Quantity Controls */}
        {onQuantityChange && (
          <div className="flex items-center gap-1 mt-3">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className={cn(
                'w-8 h-8 flex items-center justify-center',
                'border border-border rounded-md',
                'text-foreground hover:bg-secondary transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <span className="text-lg leading-none">−</span>
            </button>
            <span className="w-10 text-center text-sm font-medium text-foreground">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className={cn(
                'w-8 h-8 flex items-center justify-center',
                'border border-border rounded-md',
                'text-foreground hover:bg-secondary transition-colors'
              )}
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartItem;
