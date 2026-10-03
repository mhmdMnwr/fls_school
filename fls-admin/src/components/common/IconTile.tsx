import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export type IconTileVariant =
  | 'indigo'
  | 'green'
  | 'purple'
  | 'amber'
  | 'brand-soft'
  | 'danger'
  | 'neutral';

export interface IconTileProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  variant?: IconTileVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<IconTileVariant, { container: string; iconClass: string }> = {
  indigo: {
    container: 'bg-gradient-to-br from-[#4F46E5] to-[#6D5BF7] text-white shadow-xs',
    iconClass: 'text-white',
  },
  green: {
    container: 'bg-[#D1FAE5] text-[#10B981]',
    iconClass: 'text-[#10B981]',
  },
  purple: {
    container: 'bg-gradient-to-br from-[#A855F7] to-[#7C3AED] text-white shadow-xs',
    iconClass: 'text-white',
  },
  amber: {
    container: 'bg-[#FEF3C7] text-[#F59E0B]',
    iconClass: 'text-[#F59E0B]',
  },
  'brand-soft': {
    container: 'bg-brand-50 text-brand-600',
    iconClass: 'text-brand-600',
  },
  danger: {
    container: 'bg-[#FEE2E2] text-[#EF4444]',
    iconClass: 'text-[#EF4444]',
  },
  neutral: {
    container: 'bg-[#F1F5F9] text-[#64748B]',
    iconClass: 'text-[#64748B]',
  },
};

const sizeStyles = {
  sm: {
    container: 'w-9 h-9 rounded-[10px]',
    iconSize: 18,
  },
  md: {
    container: 'w-12 h-12 rounded-xl',
    iconSize: 24,
  },
};

export const IconTile: React.FC<IconTileProps> = ({
  icon: Icon,
  variant = 'indigo',
  size = 'md',
  className,
  ...props
}) => {
  const currentVariant = variantStyles[variant] || variantStyles.indigo;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={cn(
        'flex items-center justify-center shrink-0 transition-transform',
        currentVariant.container,
        currentSize.container,
        className
      )}
      {...props}
    >
      <Icon size={currentSize.iconSize} className={currentVariant.iconClass} />
    </div>
  );
};

export default IconTile;
