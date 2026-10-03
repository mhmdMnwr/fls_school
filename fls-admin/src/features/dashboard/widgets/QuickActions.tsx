import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, BookPlus, Layers, ChevronRight, LucideIcon } from 'lucide-react';
import IconTile, { IconTileVariant } from '@/components/common/IconTile';

interface QuickActionItem {
  label: string;
  to: string;
  icon: LucideIcon;
  variant: IconTileVariant;
}

const actions: QuickActionItem[] = [
  {
    label: 'Ajouter un élève',
    to: '/eleves?new=1',
    icon: UserPlus,
    variant: 'indigo',
  },
  {
    label: 'Ajouter un professeur',
    to: '/profs?new=1',
    icon: UserPlus,
    variant: 'green',
  },
  {
    label: 'Ajouter une matière',
    to: '/matieres?new=1',
    icon: BookPlus,
    variant: 'purple',
  },
  {
    label: 'Ajouter un niveau',
    to: '/niveaux?new=1',
    icon: Layers,
    variant: 'amber',
  },
];

export const QuickActions: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-line/60 p-5 shadow-xs flex flex-col h-full">
      <h2 className="text-base font-bold text-ink mb-4">Actions rapides</h2>
      <div className="flex-1 flex flex-col justify-between gap-2.5">
        {actions.map((act) => (
          <Link
            key={act.to}
            to={act.to}
            className="h-12 w-full flex items-center justify-between px-3.5 rounded-xl border border-line bg-white hover:bg-brand-50 hover:border-brand-500/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <IconTile
                icon={act.icon}
                variant={act.variant}
                size="sm"
                className="group-hover:scale-105 transition-transform"
              />
              <span className="text-sm font-medium text-ink group-hover:text-brand-600 transition-colors">
                {act.label}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
