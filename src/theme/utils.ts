/**
 * Theme Utility Functions
 * Helper functions for working with design tokens and theme management
 * ST-032: Design-token implementation
 */

import { theme, type ThemeVariant } from './theme';

/**
 * Get CSS custom property value for a design token
 */
export function getCSSCustomProperty(property: string): string {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  }
  return '';
}

/**
 * Set CSS custom property value
 */
export function setCSSCustomProperty(property: string, value: string): void {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty(property, value);
  }
}

/**
 * Apply theme to document root
 */
export function applyTheme(variant: ThemeVariant): void {
  if (typeof window === 'undefined') return;
  
  const { body } = document;
  const themeConfig = theme.themeVariants[variant];
  
  // Remove all theme classes
  Object.values(theme.themeVariants).forEach(({ cssClass }) => {
    if (cssClass) body.classList.remove(cssClass);
  });
  
  // Apply new theme class
  if (themeConfig.cssClass) {
    body.classList.add(themeConfig.cssClass);
  }
}

/**
 * Get current theme variant from DOM
 */
export function getCurrentTheme(): ThemeVariant {
  if (typeof window === 'undefined') return 'light';
  
  const { body } = document;
  
  if (body.classList.contains('stealth-ops')) return 'stealthOps';
  if (body.classList.contains('dark')) return 'dark';
  return 'light';
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): ThemeVariant {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
  return newTheme;
}

/**
 * Get color token with fallback
 */
export function getColorToken(tokenPath: string, fallback?: string): string {
  const parts = tokenPath.split('.');
  let current: any = theme.designTokens.colors;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return fallback || '#000000';
    }
  }
  
  return typeof current === 'string' ? current : fallback || '#000000';
}

/**
 * Generate HSL values from hex color
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const add = max + min;
  const l = add * 0.5;

  let s: number;
  let h: number;

  if (diff === 0) {
    s = h = 0;
  } else {
    s = l < 0.5 ? diff / add : diff / (2 - add);

    switch (max) {
      case r:
        h = ((g - b) / diff) + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert hex color to HSL CSS string
 */
export function hexToHslString(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return `${h} ${s}% ${l}%`;
}

/**
 * Get typography scale for responsive design
 */
export function getTypographyScale(scale: keyof typeof theme.designTokens.typography.fontSize): {
  fontSize: string;
  lineHeight: string;
} {
  const [fontSize, config] = theme.designTokens.typography.fontSize[scale];
  return {
    fontSize,
    lineHeight: typeof config === 'object' ? config.lineHeight : '1.5'
  };
}

/**
 * Create CSS custom properties object from design tokens
 */
export function createCSSCustomProperties(): Record<string, string> {
  const properties: Record<string, string> = {};
  
  // Add color properties
  Object.entries(theme.designTokens.colors).forEach(([colorName, colorScale]) => {
    if (typeof colorScale === 'object') {
      Object.entries(colorScale).forEach(([scale, value]) => {
        properties[`--color-${colorName}-${scale}`] = value;
      });
    }
  });
  
  // Add spacing properties
  Object.entries(theme.designTokens.spacing).forEach(([key, value]) => {
    properties[`--spacing-${key}`] = value;
  });
  
  // Add typography properties
  Object.entries(theme.designTokens.typography.fontSize).forEach(([key, [value]]) => {
    properties[`--font-size-${key}`] = value;
  });
  
  return properties;
}

/**
 * Validate color contrast for accessibility
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Simple contrast ratio calculation (simplified version)
  // In a real implementation, you'd want a more robust calculation
  const getLuminance = (hex: string): number => {
    const rgb = hex.match(/\w\w/g)?.map(x => parseInt(x, 16) / 255) || [0, 0, 0];
    const [r, g, b] = rgb.map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Check if color combination meets WCAG accessibility standards
 */
export function isAccessibleColorCombination(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const contrast = getContrastRatio(foreground, background);
  return level === 'AAA' ? contrast >= 7 : contrast >= 4.5;
}

/**
 * Generate theme-aware class names
 */
export function themeClass(
  baseClass: string,
  variants?: Partial<Record<ThemeVariant, string>>
): string {
  if (!variants) return baseClass;
  
  const currentTheme = getCurrentTheme();
  const variantClass = variants[currentTheme];
  
  return variantClass ? `${baseClass} ${variantClass}` : baseClass;
}

/**
 * Create responsive typography utility
 */
export function createResponsiveTypography(
  minSize: number,
  maxSize: number,
  minViewport: number = 320,
  maxViewport: number = 1200
): string {
  const slope = (maxSize - minSize) / (maxViewport - minViewport);
  const yAxisIntersection = -minViewport * slope + minSize;
  
  return `clamp(${minSize}rem, ${yAxisIntersection.toFixed(4)}rem + ${(slope * 100).toFixed(4)}vw, ${maxSize}rem)`;
}

/**
 * Get theme-specific design tokens
 */
export function getThemeTokens(variant: ThemeVariant) {
  switch (variant) {
    case 'dark':
      return {
        background: '#111827',
        foreground: '#f9fafb',
        primary: '#3b82f6',
        primaryForeground: '#ffffff',
        // Add more as needed
      };
    case 'stealthOps':
      return {
        background: '#000000',
        foreground: '#ffffff',
        primary: '#00ff00',
        primaryForeground: '#000000',
        // Add more as needed
      };
    default:
      return {
        background: '#f9fafb',
        foreground: '#111827',
        primary: '#2563eb',
        primaryForeground: '#ffffff',
        // Add more as needed
      };
  }
}

export default {
  getCSSCustomProperty,
  setCSSCustomProperty,
  applyTheme,
  getCurrentTheme,
  toggleTheme,
  getColorToken,
  hexToHsl,
  hexToHslString,
  getTypographyScale,
  createCSSCustomProperties,
  getContrastRatio,
  isAccessibleColorCombination,
  themeClass,
  createResponsiveTypography,
  getThemeTokens,
};
