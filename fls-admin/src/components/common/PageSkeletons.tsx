import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export const ListPageSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <Skeleton className="h-16 w-full rounded-2xl" />

      <div className="rounded-2xl border border-line/60 bg-white p-4 space-y-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-line-soft">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const DetailPageSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      <Skeleton className="h-4 w-40" />

      <div className="rounded-2xl border border-line/60 bg-white p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-line-soft">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 border-b border-line-soft pb-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="hidden sm:flex gap-3">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton key={idx} className="h-28 w-full rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Skeleton className="lg:col-span-5 h-80 rounded-2xl" />
        <Skeleton className="lg:col-span-4 h-80 rounded-2xl" />
        <Skeleton className="lg:col-span-3 h-80 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Skeleton className="lg:col-span-5 h-72 rounded-2xl" />
        <Skeleton className="lg:col-span-4 h-72 rounded-2xl" />
        <Skeleton className="lg:col-span-3 h-72 rounded-2xl" />
      </div>
    </div>
  );
};
