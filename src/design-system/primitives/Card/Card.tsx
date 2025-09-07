import React, { ReactNode } from 'react';
import { cn } from '../../theme/theme-utils';

export interface CardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  footer?: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const cardVariants = {
  default: 'tactical-card bg-[var(--color-card-background)]',
  bordered: 'tactical-card tactical-border bg-[var(--color-card-background)] border border-[var(--color-border-primary)]',
  elevated: 'tactical-card bg-[var(--color-card-background)] shadow-lg border border-[var(--color-border-primary)]',
};

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export function Card({
  children,
  title,
  description,
  footer,
  variant = 'bordered',
  padding = 'md',
  className,
  onClick,
}: CardProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={cn(
        'rounded-lg transition-all duration-200',
        cardVariants[variant],
        cardPadding[padding],
        onClick && 'cursor-pointer hover:shadow-lg active:scale-[0.99]',
        className
      )}
      onClick={onClick}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border-primary)]">
          {footer}
        </div>
      )}
    </Component>
  );
}