import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn('flex items-center space-x-1.5 text-xs text-muted mb-2', className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-muted/60">/</span>}
            {isLast || !item.to ? (
              <span className={cn('truncate max-w-[200px]', isLast ? 'font-semibold text-ink' : 'text-muted')}>
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-brand-600 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
