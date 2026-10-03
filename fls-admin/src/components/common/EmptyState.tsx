import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import IconTile from './IconTile';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12',
        className
      )}
    >
      <IconTile icon={icon} variant="brand-soft" size="md" className="mb-4" />
      <h3 className="text-base font-bold text-ink mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm mb-5">{description}</p>
      )}
      {children}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
