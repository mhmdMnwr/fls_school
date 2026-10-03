import React from 'react';
import { cn, hashString } from '@/lib/utils';

const COLOR_PAIRS = [
  { bg: '#E0E7FF', text: '#4338CA' },
  { bg: '#DCFCE7', text: '#15803D' },
  { bg: '#FEF3C7', text: '#B45309' },
  { bg: '#FCE7F3', text: '#BE185D' },
  { bg: '#E0F2FE', text: '#0369A1' },
  { bg: '#F3E8FF', text: '#7E22CE' },
];

export interface InitialsAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  firstName?: string;
  lastName?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'w-7 h-7 text-xs font-semibold',
  md: 'w-9 h-9 text-sm font-semibold',
  lg: 'w-11 h-11 text-base font-bold',
  xl: 'w-16 h-16 text-xl font-bold',
};

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  firstName = '',
  lastName = '',
  name = '',
  size = 'md',
  className,
  ...props
}) => {
  let initials = '';
  const fullName = name.trim() || `${firstName} ${lastName}`.trim();

  if (firstName && lastName) {
    initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  } else if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      initials = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else if (parts[0]) {
      initials = parts[0].slice(0, 2).toUpperCase();
    }
  }

  if (!initials) initials = '?';

  const pairIndex = Math.abs(hashString(fullName || 'User')) % COLOR_PAIRS.length;
  const color = COLOR_PAIRS[pairIndex];

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full shrink-0 select-none shadow-xs',
        sizeStyles[size],
        className
      )}
      style={{
        backgroundColor: color.bg,
        color: color.text,
      }}
      aria-label={fullName || 'Avatar'}
      {...props}
    >
      {initials}
    </div>
  );
};

export default InitialsAvatar;
