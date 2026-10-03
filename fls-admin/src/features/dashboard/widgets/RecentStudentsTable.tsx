import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard';
import { formatDate } from '@/lib/format';
import { InitialsAvatar } from '@/components/common/InitialsAvatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';

export const RecentStudentsTable: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'recent-students'],
    queryFn: () => dashboardApi.getRecentStudents(5),
  });

  const students = data || [];

  return (
    <div className="bg-white rounded-2xl border border-line/60 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-ink">Derniers élèves inscrits</h2>
        <Link
          to="/eleves"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      {/* Table content */}
      <div className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 h-[44px]">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Impossible de charger les élèves" onRetry={refetch} />
        ) : students.length === 0 ? (
          <div className="text-sm text-muted py-12 text-center">
            Aucun élève inscrit
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-line-soft text-muted font-medium">
                <th className="pb-2.5 font-medium">Nom et prénom</th>
                <th className="pb-2.5 font-medium">Niveau</th>
                <th className="pb-2.5 font-medium">Date d'inscription</th>
                <th className="pb-2.5 font-medium text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {students.map((student) => {
                const nameParts = student.fullName.split(' ');
                const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : student.fullName;
                const lastName = nameParts[0] || '';

                return (
                  <tr key={student.id} className="h-[52px] hover:bg-brand-50/40 transition-colors">
                    <td className="py-2 pr-2">
                      <Link
                        to={`/eleves/${student.id}`}
                        className="flex items-center gap-2.5 group"
                      >
                        <InitialsAvatar
                          firstName={firstName}
                          lastName={lastName}
                          size="sm"
                        />
                        <span className="font-semibold text-ink group-hover:text-brand-600 truncate max-w-[130px] sm:max-w-[160px]">
                          {student.fullName}
                        </span>
                      </Link>
                    </td>
                    <td className="py-2 px-2 text-body">
                      {student.levelName ? (
                        <StatusBadge variant="brand">{student.levelName}</StatusBadge>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 px-2 text-muted">
                      {formatDate(student.createdAt)}
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <StatusBadge variant={student.isActive ? 'success' : 'neutral'}>
                        {student.isActive ? 'Actif' : 'Inactif'}
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentStudentsTable;
