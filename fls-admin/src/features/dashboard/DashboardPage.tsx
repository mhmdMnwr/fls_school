import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { dashboardApi } from '@/api/dashboard';
import { formatLongDate } from '@/lib/format';
import { StatsRow } from './widgets/StatsRow';
import { EnrollmentChart } from './widgets/EnrollmentChart';
import { LevelDonutChart } from './widgets/LevelDonutChart';
import { QuickActions } from './widgets/QuickActions';
import { RecentStudentsTable } from './widgets/RecentStudentsTable';
import { UpcomingSessionsList } from './widgets/UpcomingSessionsList';
import { RecentActivitiesList } from './widgets/RecentActivitiesList';
import { TestimonialsWidget } from './widgets/TestimonialsWidget';

export default function DashboardPage() {
  useEffect(() => {
    document.title = 'Tableau de bord · FLS School';
  }, []);

  // Fetch top stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
  });

  return (
    <div className="space-y-6">
      {/* Greeting row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-ink leading-tight">
            Bonjour Admin 👋
          </h1>
          <p className="text-sm text-muted mt-1">
            Voici un aperçu général de votre école.
          </p>
        </div>

        {/* Date Pill (hidden below 768px) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-line/60 shadow-xs text-xs font-semibold text-ink">
            <CalendarDays className="w-4 h-4 text-brand-600" />
            <span>{formatLongDate(new Date())}</span>
          </div>
        </div>
      </div>

      {/* Row 1: 4 Stat Cards */}
      <StatsRow stats={stats} isLoading={statsLoading} />

      {/* Row 2: Evolution (5 cols), Repertoire (4 cols), Quick Actions (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 min-h-[340px]">
          <EnrollmentChart />
        </div>
        <div className="lg:col-span-4 min-h-[340px]">
          <LevelDonutChart />
        </div>
        <div className="lg:col-span-3 min-h-[340px]">
          <QuickActions />
        </div>
      </div>

      {/* Row 3: Recent Students (5 cols), Upcoming Sessions (4 cols), Recent Activities (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 min-h-[340px]">
          <RecentStudentsTable />
        </div>
        <div className="lg:col-span-4 min-h-[340px]">
          <UpcomingSessionsList />
        </div>
        <div className="lg:col-span-3 min-h-[340px]">
          <RecentActivitiesList />
        </div>
      </div>

      {/* Row 4: Testimonials Widget */}
      <div>
        <TestimonialsWidget />
      </div>
    </div>
  );
}
