import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { dashboardApi } from '@/api/dashboard';
import { monthLabels } from '@/lib/format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';

const fullMonthNames = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { month: number; total: number } }>;
  year: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, year }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const monthName = fullMonthNames[item.month - 1] || `Mois ${item.month}`;
    return (
      <div className="bg-white px-3.5 py-2 rounded-xl shadow-lg border border-line text-xs">
        <p className="font-bold text-ink">{`${monthName} ${year}`}</p>
        <p className="text-brand-600 font-semibold mt-0.5">
          {`${item.total} élève${item.total > 1 ? 's' : ''}`}
        </p>
      </div>
    );
  }
  return null;
};

export const EnrollmentChart: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', 'enrollment-evolution', selectedYear],
    queryFn: () => dashboardApi.getEnrollmentEvolution(selectedYear),
  });

  const chartData = data || [];
  const hasData = chartData.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-line/60 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-ink">Évolution des effectifs</h2>
        <Select
          value={String(selectedYear)}
          onValueChange={(val) => setSelectedYear(Number(val))}
        >
          <SelectTrigger className="w-[140px] h-8 rounded-lg bg-page-bg border-line text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={String(currentYear)}>Cette année</SelectItem>
            <SelectItem value={String(currentYear - 1)}>Année dernière</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart container */}
      <div className="flex-1 w-full min-h-[260px] flex items-center justify-center">
        {isLoading ? (
          <div className="w-full h-[260px] flex flex-col justify-end gap-2 p-2">
            <div className="flex items-end gap-2 h-full">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{ height: `${20 + (i * 8) % 70}%` }}
                />
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        ) : isError ? (
          <ErrorState message="Impossible de charger les données du graphique" onRetry={refetch} />
        ) : !hasData ? (
          <div className="text-sm text-muted py-12 text-center">
            Aucune donnée pour cette année
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7F2"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickFormatter={(m: number) => monthLabels[(m - 1) % 12] || ''}
                stroke="#6B7194"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                stroke="#6B7194"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomTooltip year={selectedYear} />}
                cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#4F46E5"
                strokeWidth={2}
                fill="url(#enrollmentGrad)"
                dot={{
                  r: 3,
                  fill: '#4F46E5',
                  stroke: '#FFFFFF',
                  strokeWidth: 1.5,
                }}
                activeDot={{
                  r: 5,
                  fill: '#4F46E5',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default EnrollmentChart;
