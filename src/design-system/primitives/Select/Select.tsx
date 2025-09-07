import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '../../theme/theme-utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  label?: string;
  error?: boolean;
  helperText?: string;
  selectSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  placeholder?: string;
}

const selectSizes = {
  sm: 'h-8 px-3 pr-8 text-sm',
  md: 'h-10 px-4 pr-10 text-sm',
  lg: 'h-12 px-4 pr-10 text-base',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className,
    options,
    label,
    error = false,
    helperText,
    selectSize = 'md',
    fullWidth = true,
    placeholder = 'Select an option',
    disabled,
    ...props
  }, ref) => {
    const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              // Base styles
              'appearance-none rounded-md transition-colors duration-200',
              'bg-[var(--color-input-background)] border border-[var(--color-input-border)]',
              'text-[var(--color-text-primary)]',
              'focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]',
              'focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'disabled:bg-[var(--color-background-tertiary)]',
              
              // Size styles
              selectSizes[selectSize],
              
              // Error state
              error && [
                'border-[var(--color-feedback-error)]',
                'focus:border-[var(--color-feedback-error)]',
                'focus:ring-[var(--color-feedback-error)]',
              ],
              
              // Full width
              fullWidth && 'w-full',
              
              className
            )}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <ChevronDown 
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
              'w-4 h-4 text-[var(--color-text-secondary)]',
              disabled && 'opacity-50'
            )}
          />
        </div>
        
        {helperText && (
          <p
            className={cn(
              'mt-1 text-xs',
              error ? 'text-[var(--color-feedback-error)]' : 'text-[var(--color-text-secondary)]'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';