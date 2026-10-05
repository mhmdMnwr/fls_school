import React from 'react';
import { Users, Layers, BookOpen, GraduationCap, ArrowUp } from 'lucide-react';
import { DashboardStats } from '@/types/api';
import { StatCard } from '@/components/common/StatCard';

interface StatsRowProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats, isLoading = false }) => {
  const newThisMonth = stats?.students?.newThisMonth ?? 0;

  const studentsSubline = (
    <div className="flex flex-wrap items-center gap-1.5">
      {newThisMonth > 0 ? (
        <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold">
          <ArrowUp className="w-3.5 h-3.5" />
          <span>+{newThisMonth} ce mois</span>
        </span>
      ) : (
        <span className="text-muted">0 nouvelle inscription</span>
      )}
      {(stats?.preRegistrations ?? 0) > 0 && (
        <span className="text-amber-600 font-semibold">
          • {stats?.preRegistrations} pré-inscrit(s)
        </span>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
      <StatCard
        label="Total élèves"
        value={stats?.students?.total ?? 0}
        icon={Users}
        variant="indigo"
        subline={studentsSubline}
        to="/eleves"
        isLoading={isLoading}
      />
      <StatCard
        label="Niveaux"
        value={stats?.levels?.total ?? 0}
        icon={Layers}
        variant="green"
        subline="Cycles d'enseignement"
        to="/niveaux"
        isLoading={isLoading}
      />
      <StatCard
        label="Matières"
        value={stats?.subjects?.total ?? 0}
        icon={BookOpen}
        variant="purple"
        subline="Enseignements proposés"
        to="/matieres"
        isLoading={isLoading}
      />
      <StatCard
        label="Professeurs"
        value={stats?.teachers?.total ?? 0}
        icon={GraduationCap}
        variant="amber"
        subline="Enseignants actifs"
        to="/profs"
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatsRow;
