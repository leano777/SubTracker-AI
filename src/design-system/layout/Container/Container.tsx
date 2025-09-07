import React, { ReactNode } from 'react';
import { cn } from '../../theme/theme-utils';

export interface ContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  centered?: boolean;
  className?: string;
}

const maxWidthValues = {
  sm: 'max-w-screen-sm', // 640px
  md: 'max-w-screen-md', // 768px
  lg: 'max-w-screen-lg', // 1024px
  xl: 'max-w-screen-xl', // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  full: 'max-w-full',
};

export function Container({
  children,
  maxWidth = 'xl',
  padding = true,
  centered = true,
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        maxWidthValues[maxWidth],
        padding && 'px-4 sm:px-6 lg:px-8',
        centered && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
}