import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
  className,
}) => {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');

      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line-soft p-4 text-sm',
        className
      )}
    >
      <div className="text-muted text-xs sm:text-sm">
        Affichage de <span className="font-semibold text-ink">{start}</span> à{' '}
        <span className="font-semibold text-ink">{end}</span> sur{' '}
        <span className="font-semibold text-ink">{total}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onLimitChange && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted mr-2">
            <span>Par page</span>
            <Select
              value={String(limit)}
              onValueChange={(val) => onLimitChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 px-2.5 rounded-lg text-xs gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Précédent</span>
          </Button>

          {pages.map((p, idx) => {
            if (p === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8 w-8 items-center justify-center text-muted"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const isActive = p === page;
            return (
              <Button
                key={p}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(p)}
                className={cn(
                  'h-8 w-8 p-0 rounded-lg text-xs font-medium',
                  isActive
                    ? 'bg-brand-600 hover:bg-brand-700 text-white font-semibold'
                    : 'text-body hover:bg-brand-50 hover:text-brand-700'
                )}
              >
                {p}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 px-2.5 rounded-lg text-xs gap-1"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
