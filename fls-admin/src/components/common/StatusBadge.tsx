import React from 'react';
import { cn } from '@/lib/utils';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'brand';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  children: React.ReactNode;
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-[#DCFCE7] text-[#15803D]',
  warning: 'bg-[#FEF3C7] text-[#B45309]',
  danger: 'bg-[#FEE2E2] text-[#B91C1C]',
  neutral: 'bg-[#F1F5F9] text-[#64748B]',
  brand: 'bg-brand-100 text-brand-700',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'neutral',
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default StatusBadge;
