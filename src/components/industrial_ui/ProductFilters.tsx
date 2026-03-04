import React from 'react';
import { cn } from '@/lib/utils';

export interface FilterCategory {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'toggle';
  options: FilterOption[];
}

export interface ProductFiltersProps {
  title?: string;
  categories: FilterCategory[];
  selectedCategoryId?: string;
  filterGroups: FilterGroup[];
  onCategoryChange?: (categoryId: string) => void;
  onFilterChange?: (groupId: string, optionId: string, checked: boolean) => void;
  className?: string;
}

export function ProductFilters({
  title = 'Categories',
  categories,
  selectedCategoryId,
  filterGroups,
  onCategoryChange,
  onFilterChange,
  className,
}: ProductFiltersProps) {
  return (
    <div className={cn('', className)}>
      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {title}
        </h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange?.(category.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left',
                selectedCategoryId === category.id
                  ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {category.icon && (
                <span className="flex-shrink-0">{category.icon}</span>
              )}
              <span className="flex-1">{category.label}</span>
              {category.count !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Groups */}
      {filterGroups.map((group) => (
        <div key={group.id} className="mb-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {group.label}
          </h4>

          {group.type === 'checkbox' ? (
            <div className="space-y-2">
              {group.options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={option.checked}
                    onChange={(e) =>
                      onFilterChange?.(group.id, option.id, e.target.checked)
                    }
                    className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() =>
                    onFilterChange?.(group.id, option.id, !option.checked)
                  }
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
                    option.checked
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-foreground/30'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProductFilters;
