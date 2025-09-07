import React, { ReactNode } from 'react';
import { cn } from '../../theme/theme-utils';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const alertVariants = {
  info: {
    container: 'bg-[var(--color-feedback-info-bg)] border-[var(--color-feedback-info)]',
    icon: 'text-[var(--color-feedback-info)]',
    title: 'text-[var(--color-feedback-info)]',
    defaultIcon: Info,
  },
  success: {
    container: 'bg-[var(--color-feedback-success-bg)] border-[var(--color-feedback-success)]',
    icon: 'text-[var(--color-feedback-success)]',
    title: 'text-[var(--color-feedback-success)]',
    defaultIcon: CheckCircle,
  },
  warning: {
    container: 'bg-[var(--color-feedback-warning-bg)] border-[var(--color-feedback-warning)]',
    icon: 'text-[var(--color-feedback-warning)]',
    title: 'text-[var(--color-feedback-warning)]',
    defaultIcon: AlertCircle,
  },
  error: {
    container: 'bg-[var(--color-feedback-error-bg)] border-[var(--color-feedback-error)]',
    icon: 'text-[var(--color-feedback-error)]',
    title: 'text-[var(--color-feedback-error)]',
    defaultIcon: XCircle,
  },
};

export function Alert({
  variant = 'info',
  title,
  description,
  children,
  icon,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const variantStyles = alertVariants[variant];
  const IconComponent = variantStyles.defaultIcon;

  return (
    <div
      className={cn(
        'relative flex gap-3 p-4 rounded-lg border',
        variantStyles.container,
        className
      )}
      role="alert"
    >
      <div className={cn('flex-shrink-0', variantStyles.icon)}>
        {icon || <IconComponent className="w-5 h-5" />}
      </div>
      
      <div className="flex-1">
        {title && (
          <h3 className={cn('font-medium text-sm mb-1', variantStyles.title)}>
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
        {children && (
          <div className="text-sm text-[var(--color-text-secondary)]">
            {children}
          </div>
        )}
      </div>
      
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]'
          )}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
        </button>
      )}
    </div>
  );
}