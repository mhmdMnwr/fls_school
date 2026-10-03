import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import IconTile from './IconTile';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Erreur de chargement',
  message = 'Une erreur est survenue lors du chargement.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12',
        className
      )}
    >
      <IconTile icon={AlertCircle} variant="danger" size="md" className="mb-4" />
      <h3 className="text-base font-bold text-ink mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
