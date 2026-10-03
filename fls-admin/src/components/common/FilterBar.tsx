import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  hasActiveFilters = false,
  onResetFilters,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-line/60 p-4 shadow-xs',
        className
      )}
    >
      {onSearchChange !== undefined && (
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <Input
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 h-10 rounded-xl bg-white border-line text-sm focus:border-brand-600 focus:ring-brand-500/30"
          />
        </div>
      )}

      {children && (
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {children}
        </div>
      )}

      {hasActiveFilters && onResetFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="text-xs text-muted hover:text-ink hover:bg-brand-50 h-10 px-3 rounded-xl gap-1.5 ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  );
};

export default FilterBar;
