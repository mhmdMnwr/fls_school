import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { dashboardApi } from '@/api/dashboard';
import { monthLabels } from '@/lib/format';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';

export const UpcomingSessionsList: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'upcoming-sessions'],
    queryFn: () => dashboardApi.getUpcomingSessions(4),
  });

  const sessions = data || [];

  return (
    <div className="bg-white rounded-2xl border border-line/60 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-ink">Prochains cours</h2>
        <Link
          to="/seances"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      {/* List content */}
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="space-y-3 py-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 p-2">
                <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Impossible de charger les cours" onRetry={refetch} />
        ) : sessions.length === 0 ? (
          <div className="text-sm text-muted py-12 text-center">
            Aucun cours programmé
          </div>
        ) : (
          <div className="divide-y divide-line-soft -mx-1">
            {sessions.map((item) => {
              const d = new Date(item.date);
              const dayNum = isNaN(d.getTime()) ? '—' : d.getDate();
              const monthAbbr = isNaN(d.getTime()) ? '' : monthLabels[d.getMonth()] || '';

              return (
                <Link
                  key={item.id}
                  to={`/seances/${item.id}`}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-brand-50/50 transition-colors group"
                >
                  {/* Date tile */}
                  <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-100/60 flex flex-col items-center justify-center shrink-0">
                    <span className="text-base font-bold text-brand-600 leading-none">
                      {dayNum}
                    </span>
                    <span className="text-[11px] font-medium text-muted mt-0.5 uppercase tracking-wider leading-none">
                      {monthAbbr}
                    </span>
                  </div>

                  {/* Course Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-sm font-semibold text-ink truncate group-hover:text-brand-600 transition-colors">
                        {item.subjectName || 'Séance'}
                      </p>
                      {item.isFreeTrial && (
                        <StatusBadge variant="warning" className="text-[10px] px-1.5 py-0">
                          Essai
                        </StatusBadge>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate">
                      {item.className ? `${item.className} · ` : ''}
                      {item.timeRange || `${item.startTime} - ${item.endTime}`}
                    </p>
                    {item.teacherName && (
                      <div className="flex items-center gap-1.5 text-xs text-body mt-0.5 truncate">
                        <User className="w-3 h-3 text-muted shrink-0" />
                        <span className="truncate">{item.teacherName}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingSessionsList;
