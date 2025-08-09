"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";
import * as React from "react";

interface ToasterEnhancedProps extends Omit<ToasterProps, 'theme'> {
  /**
   * Enable motion animations for toast notifications
   * @default true
   */
  enableMotion?: boolean;
}

const Toaster = ({ enableMotion = true, ...props }: ToasterEnhancedProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      data-slot="toaster"
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          ...props.toastOptions?.classNames,
        },
        duration: 4000,
        ...props.toastOptions,
      }}
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-border": "hsl(var(--border))",
          "--normal-text": "hsl(var(--foreground))",
          "--success-bg": "hsl(var(--background))",
          "--success-border": "hsl(var(--success))",
          "--success-text": "hsl(var(--success))",
          "--info-bg": "hsl(var(--background))",
          "--info-border": "hsl(var(--primary))",
          "--info-text": "hsl(var(--primary))",
          "--warning-bg": "hsl(var(--background))",
          "--warning-border": "hsl(var(--warning))",
          "--warning-text": "hsl(var(--warning))",
          "--error-bg": "hsl(var(--background))",
          "--error-border": "hsl(var(--destructive))",
          "--error-text": "hsl(var(--destructive))",
          ...props.style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, type ToasterEnhancedProps };
