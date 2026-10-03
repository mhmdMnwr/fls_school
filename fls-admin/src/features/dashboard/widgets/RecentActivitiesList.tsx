import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard';
import { getActivityConfig } from '@/lib/labels';
import { relativeTime } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';

export const RecentActivitiesList: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: () => dashboardApi.getRecentActivities(5),
  });

  const activities = data || [];

  return (
    <div className="bg-white rounded-2xl border border-line/60 p-5 shadow-xs flex flex-col h-full">
      {/* Header (No link) */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-ink">Dernières activités</h2>
      </div>

      {/* List content */}
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="space-y-3 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-1.5">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Impossible de charger les activités" onRetry={refetch} />
        ) : activities.length === 0 ? (
          <div className="text-sm text-muted py-12 text-center">
            Aucune activité récente
          </div>
        ) : (
          <div className="divide-y divide-line-soft -mx-1">
            {activities.map((item) => {
              const cfg = getActivityConfig(item.type, item.title);
              const Icon = cfg.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-brand-50/40 transition-colors"
                >
                  {/* 36px circle icon */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: cfg.bg, color: cfg.iconColor }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Activity Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <p className="text-[13px] font-semibold text-ink leading-tight">
                        {cfg.title}
                      </p>
                      <span className="text-[11px] text-muted shrink-0 ml-1">
                        {relativeTime(item.createdAt)}
                      </span>
                    </div>
                    {item.detail && (
                      <p className="text-xs text-muted truncate mt-0.5">
                        {item.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivitiesList;
