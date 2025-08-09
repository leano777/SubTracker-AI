/**
 * Theme System - Main Export
 * Complete design token system for ST-032 implementation
 * Provides unified access to design tokens, theme utilities, and type definitions
 */

// Core theme exports
export {
  theme,
  designTokens,
  shadcnTokens,  
  radixTokens,
  themeVariants,
  type ThemeVariant,
  type DesignTokens,
  type ShadcnTokens,
  type RadixTokens
} from './theme';

// Utility exports
export {
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
  default as themeUtils
} from './utils';

// Re-export everything as a convenient default export
export { theme as default } from './theme';
