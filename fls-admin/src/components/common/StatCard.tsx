import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import IconTile, { IconTileVariant } from './IconTile';
import { Skeleton } from '@/components/ui/skeleton';

export interface StatCardProps {
  label: string;
  value?: number | string;
  icon: LucideIcon;
  variant?: IconTileVariant;
  subline?: React.ReactNode;
  to?: string;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  variant = 'indigo',
  subline,
  to,
  onClick,
  isLoading = false,
  className,
}) => {
  const content = (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-2xl bg-white border border-line/60 p-5 md:p-6 shadow-sm transition-all duration-150',
        (to || onClick) && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-brand-500/30',
        className
      )}
      onClick={onClick}
    >
      <IconTile icon={icon} variant={variant} size="md" className="group-hover:scale-105 transition-transform" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-body truncate">{label}</p>
        {isLoading ? (
          <div className="space-y-1.5 mt-1">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <p className="text-[28px] leading-tight font-bold text-ink mt-0.5 truncate tracking-tight">
              {value ?? 0}
            </p>
            {subline && (
              <div className="text-xs text-muted mt-1 truncate flex items-center gap-1">
                {subline}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="block focus:outline-none">{content}</Link>;
  }

  return content;
};

export default StatCard;
