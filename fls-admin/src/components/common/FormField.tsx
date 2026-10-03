import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  helperText,
  className,
  children,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label
          htmlFor={id}
          className="text-sm font-medium text-ink flex items-center gap-1"
        >
          {label}
          {required && <span className="text-danger">*</span>}
        </Label>
      )}
      {children}
      {helperText && !error && (
        <p className="text-xs text-muted mt-1">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-danger font-medium mt-1 animate-in fade-in-50 duration-150">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
