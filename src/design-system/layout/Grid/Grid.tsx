import React, { ReactNode } from 'react';
import { cn } from '../../theme/theme-utils';

export interface GridProps {
  children: ReactNode;
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const gapValues = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export function Grid({
  children,
  cols = 1,
  gap = 'md',
  className,
}: GridProps) {
  const getGridCols = () => {
    if (typeof cols === 'number') {
      return `grid-cols-${cols}`;
    }
    
    const classes = [];
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div
      className={cn(
        'grid',
        typeof cols === 'number' ? `grid-cols-${cols}` : `grid-cols-1 ${getGridCols()}`,
        gapValues[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

export interface GridItemProps {
  children: ReactNode;
  span?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  start?: number;
  end?: number;
  className?: string;
}

export function GridItem({
  children,
  span,
  start,
  end,
  className,
}: GridItemProps) {
  const getSpanClasses = () => {
    if (!span) return '';
    
    if (typeof span === 'number') {
      return `col-span-${span}`;
    }
    
    const classes = [];
    if (span.sm) classes.push(`sm:col-span-${span.sm}`);
    if (span.md) classes.push(`md:col-span-${span.md}`);
    if (span.lg) classes.push(`lg:col-span-${span.lg}`);
    if (span.xl) classes.push(`xl:col-span-${span.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div
      className={cn(
        getSpanClasses(),
        start && `col-start-${start}`,
        end && `col-end-${end}`,
        className
      )}
    >
      {children}
    </div>
  );
}