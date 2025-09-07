import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../theme/theme-utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  error?: boolean;
  helperText?: string;
  checkboxSize?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

const checkboxSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    className,
    label,
    error = false,
    helperText,
    checkboxSize = 'md',
    indeterminate = false,
    disabled,
    checked,
    ...props
  }, ref) => {
    const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col">
        <div className="flex items-start">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className={cn(
                'peer sr-only',
                className
              )}
              checked={checked}
              disabled={disabled}
              aria-checked={indeterminate ? 'mixed' : checked}
              {...props}
            />
            <label
              htmlFor={checkboxId}
              className={cn(
                // Base styles
                'relative flex items-center justify-center rounded',
                'border-2 transition-all duration-200 cursor-pointer',
                'bg-[var(--color-input-background)] border-[var(--color-input-border)]',
                
                // Hover state
                'hover:border-[var(--color-border-focus)]',
                
                // Focus state
                'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-border-focus)] peer-focus-visible:ring-offset-2',
                
                // Checked state
                'peer-checked:bg-[var(--color-brand-primary)] peer-checked:border-[var(--color-brand-primary)]',
                
                // Disabled state
                'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
                'peer-disabled:bg-[var(--color-background-tertiary)]',
                
                // Error state
                error && 'border-[var(--color-feedback-error)]',
                
                // Size
                checkboxSizes[checkboxSize]
              )}
            >
              <Check
                className={cn(
                  'text-white opacity-0 transition-opacity duration-200',
                  'peer-checked:opacity-100',
                  iconSizes[checkboxSize],
                  indeterminate && 'opacity-100'
                )}
                strokeWidth={3}
              />
              {indeterminate && (
                <div
                  className={cn(
                    'absolute bg-[var(--color-brand-primary)]',
                    'h-0.5 w-3',
                    checkboxSize === 'sm' && 'w-2',
                    checkboxSize === 'lg' && 'w-4'
                  )}
                />
              )}
            </label>
          </div>
          
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'ml-2 text-sm text-[var(--color-text-primary)] cursor-pointer select-none',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {label}
            </label>
          )}
        </div>
        
        {helperText && (
          <p
            className={cn(
              'mt-1 text-xs',
              error ? 'text-[var(--color-feedback-error)]' : 'text-[var(--color-text-secondary)]',
              label && 'ml-6'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';