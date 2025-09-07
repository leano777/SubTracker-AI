import React, { ReactNode } from 'react';
import { cn } from '../../theme/theme-utils';
import { X } from 'lucide-react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  dismissible?: boolean;
  onDismiss?: () => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

const badgeVariants = {
  default: 'bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border-primary)] font-mono uppercase tracking-wider',
  primary: 'bg-[var(--color-brand-primary)] text-white border border-[var(--color-brand-primary)] font-mono uppercase tracking-wider',
  secondary: 'bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border-secondary)] font-mono uppercase tracking-wider',
  success: 'bg-[var(--color-feedback-success-bg)] text-[var(--color-feedback-success)] border border-[var(--color-feedback-success)] font-mono uppercase tracking-wider tactical-glow',
  warning: 'bg-[var(--color-feedback-warning-bg)] text-[var(--color-feedback-warning)] border border-[var(--color-feedback-warning)] font-mono uppercase tracking-wider',
  error: 'bg-[var(--color-feedback-error-bg)] text-[var(--color-feedback-error)] border border-[var(--color-feedback-error)] font-mono uppercase tracking-wider',
  outline: 'bg-transparent border-2 border-[var(--color-border-primary)] text-[var(--color-text-primary)] font-mono uppercase tracking-wider',
};

const badgeSizes = {
  xs: 'text-xs px-1.5 py-0.5 gap-1',
  sm: 'text-xs px-2 py-1 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
};

const badgeRounded = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  rounded = 'md',
  dismissible = false,
  onDismiss,
  leftIcon,
  rightIcon,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        badgeVariants[variant],
        badgeSizes[size],
        badgeRounded[rounded],
        className
      )}
    >
      {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 ml-1 -mr-0.5',
            'hover:opacity-75 transition-opacity',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-1',
            'rounded-sm'
          )}
          aria-label="Remove badge"
        >
          <X className={cn(
            size === 'xs' && 'w-3 h-3',
            size === 'sm' && 'w-3 h-3',
            size === 'md' && 'w-3.5 h-3.5',
            size === 'lg' && 'w-4 h-4'
          )} />
        </button>
      )}
    </span>
  );
}