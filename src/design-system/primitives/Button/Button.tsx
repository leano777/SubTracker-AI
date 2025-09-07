import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '../../theme/theme-utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

const buttonVariants = {
  primary: 'tactical-button bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-hover)] active:bg-[var(--color-brand-active)] border border-[var(--color-brand-primary)]',
  secondary: 'tactical-button bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-tertiary)] border border-[var(--color-border-primary)]',
  ghost: 'tactical-button bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]/50 border border-transparent hover:border-[var(--color-border-primary)]',
  destructive: 'tactical-button bg-[var(--color-feedback-error)] text-white hover:bg-[var(--color-feedback-error)]/90 border border-[var(--color-feedback-error)]',
  outline: 'tactical-button bg-transparent border-2 border-[var(--color-border-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)] hover:border-[var(--color-brand-primary)]',
};

const buttonSizes = {
  xs: 'text-xs px-2 py-1 gap-1',
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
  xl: 'text-lg px-6 py-3 gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants[variant],
        buttonSizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}