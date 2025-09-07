import React, { ReactNode } from 'react';
import { cn } from '../../theme/theme-utils';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

export function Breadcrumb({
  items,
  separator = <ChevronRight className="w-4 h-4" />,
  className,
  onItemClick,
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.active || isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-[var(--color-text-tertiary)]">
                  {separator}
                </span>
              )}
              
              {item.href && !isActive ? (
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (onItemClick) {
                      e.preventDefault();
                      onItemClick(item, index);
                    }
                  }}
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium',
                    'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                    'transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2 rounded'
                  )}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  {item.label}
                </a>
              ) : (
                <span
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-medium',
                    isActive
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-tertiary)]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}