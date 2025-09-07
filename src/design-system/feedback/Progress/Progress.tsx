import React from 'react';
import { cn } from '../../theme/theme-utils';

export interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
  indeterminate?: boolean;
}

const progressVariants = {
  default: 'bg-[var(--color-brand-primary)] shadow-[0_0_10px_var(--color-brand-primary)]',
  success: 'bg-[var(--color-feedback-success)] shadow-[0_0_10px_var(--color-feedback-success)]',
  warning: 'bg-[var(--color-feedback-warning)] shadow-[0_0_10px_var(--color-feedback-warning)]',
  error: 'bg-[var(--color-feedback-error)] shadow-[0_0_10px_var(--color-feedback-error)]',
};

const progressSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
};

export function Progress({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  className,
  indeterminate = false,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-secondary)]">
              {label}
            </span>
          )}
          {showLabel && !indeterminate && (
            <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div
        className={cn(
          'w-full bg-[var(--color-background-tertiary)] border border-[var(--color-border-primary)] overflow-hidden relative',
          progressSizes[size]
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        style={{
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)'
        }}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out relative',
            progressVariants[variant],
            indeterminate && 'animate-[progressIndeterminate_1.5s_ease-in-out_infinite]'
          )}
          style={indeterminate ? undefined : { width: `${percentage}%` }}
        >
          {/* Animated stripes for tactical look */}
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
              animation: 'slide 1s linear infinite',
            }}
          />
        </div>
        {/* Grid overlay for tactical effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, var(--color-border-primary) 0px, transparent 1px, transparent 10px)',
          }}
        />
      </div>
    </div>
  );
}

// Circular Progress Component
export interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'error';
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
  indeterminate?: boolean;
}

const circularSizes = {
  sm: { size: 32, strokeWidth: 3 },
  md: { size: 48, strokeWidth: 4 },
  lg: { size: 64, strokeWidth: 5 },
  xl: { size: 80, strokeWidth: 6 },
};

export function CircularProgress({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  strokeWidth,
  showLabel = false,
  className,
  indeterminate = false,
}: CircularProgressProps) {
  const sizeConfig = circularSizes[size];
  const actualStrokeWidth = strokeWidth || sizeConfig.strokeWidth;
  const radius = (sizeConfig.size - actualStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        className={cn(
          indeterminate && 'animate-spin'
        )}
        width={sizeConfig.size}
        height={sizeConfig.size}
        viewBox={`0 0 ${sizeConfig.size} ${sizeConfig.size}`}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <circle
          className="text-[var(--color-background-tertiary)]"
          strokeWidth={actualStrokeWidth}
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={sizeConfig.size / 2}
          cy={sizeConfig.size / 2}
          strokeDasharray="2 4"
          opacity="0.5"
        />
        <circle
          className={cn(
            'transition-all duration-300 ease-out',
            variant === 'default' && 'text-[var(--color-brand-primary)]',
            variant === 'success' && 'text-[var(--color-feedback-success)]',
            variant === 'warning' && 'text-[var(--color-feedback-warning)]',
            variant === 'error' && 'text-[var(--color-feedback-error)]'
          )}
          strokeWidth={actualStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.75 : strokeDashoffset}
          strokeLinecap="square"
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={sizeConfig.size / 2}
          cy={sizeConfig.size / 2}
          transform={`rotate(-90 ${sizeConfig.size / 2} ${sizeConfig.size / 2})`}
          style={{
            filter: `drop-shadow(0 0 6px currentColor)`,
          }}
        />
      </svg>
      
      {showLabel && !indeterminate && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'font-mono font-bold text-[var(--color-text-primary)]',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base',
            size === 'xl' && 'text-lg'
          )}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}