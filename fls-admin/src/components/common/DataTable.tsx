import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data = [],
  isLoading = false,
  isError = false,
  onRetry,
  emptyState,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  return (
    <div className={cn('relative w-full overflow-x-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow className="h-11 bg-[#F8F9FD] border-b border-line-soft hover:bg-[#F8F9FD]">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  'text-xs font-medium text-muted px-4',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.className
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, rIdx) => (
              <TableRow key={`skeleton-${rIdx}`} className="h-14 border-b border-line-soft">
                {columns.map((col, cIdx) => (
                  <TableCell key={`skel-cell-${rIdx}-${cIdx}`} className="px-4 py-3">
                    <Skeleton className="h-5 w-full max-w-[140px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-48 text-center p-0">
                {emptyState || <EmptyState title="Aucune donnée trouvée" />}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={row.id ? String(row.id) : index}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'h-14 border-b border-line-soft text-sm text-body hover:bg-[#F8F9FF] transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      'px-4 py-3 align-middle',
                      col.align === 'right' && 'text-right font-medium',
                      col.align === 'center' && 'text-center',
                      col.className
                    )}
                  >
                    {col.render ? col.render(row, index) : (row as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;
