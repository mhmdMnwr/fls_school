import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '@/api/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';

const LEVEL_COLORS = [
  '#4F46E5', // brand indigo
  '#10B981', // emerald green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
];

export const LevelDonutChart: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'students-by-level'],
    queryFn: dashboardApi.getStudentsByLevel,
  });

  const levelData = data || [];
  const totalStudents = levelData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-line/60 p-5 shadow-xs flex flex-col h-full">
      {/* Title */}
      <h2 className="text-base font-bold text-ink mb-4">Répartition par niveau</h2>

      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <div className="w-full flex items-center gap-6 py-4">
            <Skeleton className="w-[150px] h-[150px] rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : isError ? (
          <ErrorState message="Impossible de charger la répartition" onRetry={refetch} />
        ) : levelData.length === 0 || totalStudents === 0 ? (
          <div className="text-sm text-muted py-12 text-center">
            Aucune donnée pour le moment
          </div>
        ) : (
          <div className="w-full flex flex-col sm:flex-row items-center gap-6 py-2">
            {/* Donut chart with centered text */}
            <div className="relative w-[150px] h-[150px] shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={levelData}
                    dataKey="count"
                    nameKey="level"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {levelData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={LEVEL_COLORS[index % LEVEL_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[22px] font-bold text-ink leading-tight">
                  {totalStudents}
                </span>
                <span className="text-xs text-muted">élèves</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex-1 w-full space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {levelData.map((item, index) => {
                const color = LEVEL_COLORS[index % LEVEL_COLORS.length];
                return (
                  <div
                    key={item.levelId || item.level}
                    className="flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-ink truncate">
                        {item.level}
                      </span>
                    </div>
                    <span className="font-semibold text-body shrink-0">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelDonutChart;
