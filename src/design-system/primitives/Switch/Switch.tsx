import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../theme/theme-utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  labelPosition?: 'left' | 'right';
  switchSize?: 'sm' | 'md' | 'lg';
  onLabel?: string;
  offLabel?: string;
}

const switchSizes = {
  sm: {
    track: 'w-8 h-4',
    thumb: 'w-3 h-3',
    translate: 'peer-checked:translate-x-4',
  },
  md: {
    track: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'peer-checked:translate-x-5',
  },
  lg: {
    track: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'peer-checked:translate-x-7',
  },
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({
    className,
    label,
    labelPosition = 'right',
    switchSize = 'md',
    onLabel,
    offLabel,
    disabled,
    checked,
    ...props
  }, ref) => {
    const switchId = props.id || `switch-${Math.random().toString(36).substr(2, 9)}`;
    const size = switchSizes[switchSize];

    return (
      <div className="flex items-center">
        {label && labelPosition === 'left' && (
          <label
            htmlFor={switchId}
            className={cn(
              'mr-3 text-sm text-[var(--color-text-primary)] cursor-pointer select-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative inline-flex items-center">
          {offLabel && (
            <span className={cn(
              'mr-2 text-xs text-[var(--color-text-secondary)]',
              !checked && 'text-[var(--color-text-primary)]'
            )}>
              {offLabel}
            </span>
          )}
          
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            className={cn('peer sr-only', className)}
            checked={checked}
            disabled={disabled}
            role="switch"
            aria-checked={checked}
            {...props}
          />
          
          <label
            htmlFor={switchId}
            className={cn(
              // Track styles
              'relative inline-block rounded-full cursor-pointer',
              'transition-colors duration-200',
              'bg-[var(--color-background-tertiary)]',
              'peer-checked:bg-[var(--color-brand-primary)]',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-border-focus)] peer-focus-visible:ring-offset-2',
              size.track
            )}
          >
            <span
              className={cn(
                // Thumb styles
                'absolute left-0.5 top-0.5',
                'inline-block rounded-full',
                'bg-white shadow-sm',
                'transition-transform duration-200',
                'peer-disabled:opacity-50',
                size.thumb,
                size.translate
              )}
            />
          </label>
          
          {onLabel && (
            <span className={cn(
              'ml-2 text-xs text-[var(--color-text-secondary)]',
              checked && 'text-[var(--color-text-primary)]'
            )}>
              {onLabel}
            </span>
          )}
        </div>
        
        {label && labelPosition === 'right' && (
          <label
            htmlFor={switchId}
            className={cn(
              'ml-3 text-sm text-[var(--color-text-primary)] cursor-pointer select-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';