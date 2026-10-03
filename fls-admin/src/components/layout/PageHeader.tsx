import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LucideIcon } from 'lucide-react';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  actionComponent?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  actionComponent,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted mt-1">{subtitle}</p>
          )}
        </div>

        {actionComponent ? (
          <div>{actionComponent}</div>
        ) : actionLabel && onAction ? (
          <Button
            onClick={onAction}
            className="rounded-xl h-10 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-xs self-start sm:self-auto gap-2"
          >
            <ActionIcon className="w-4 h-4" />
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default PageHeader;
