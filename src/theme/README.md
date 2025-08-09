# Design Token System (ST-032)

## Phase 2 – Global Style System Refactor

This is the complete implementation of **ST-032: Design-token implementation**, featuring a comprehensive design token system that maps Figma design variables to shadcn/ui and Radix primitives.

## 🎯 Key Features

### 1. Migrated Color Tokens to Tailwind `theme.extend.colors`
- Complete Figma design variable mapping
- Primary, secondary, accent, success, warning, destructive color scales
- Extended with neutral colors and glass morphism tokens
- CSS custom property fallbacks for all theme variants

### 2. Typography Utilities (`@layer components`)
- **Heading scales**: `.h1` through `.h6` with responsive sizing
- **Body typography**: `.body-xl`, `.body-lg`, `.body-md`, `.body-sm`, `.body-xs`
- **Display typography**: `.display-xl`, `.display-lg`, `.display-md` for hero text
- **Code typography**: `.code` (inline) and `.code-block` (block)
- **Caption text**: `.caption` for labels and micro-copy

### 3. Theme Mapping (`theme.ts`)
- **Design tokens**: Complete color, typography, spacing, and radius scales
- **shadcn/ui integration**: Direct mapping to CSS custom properties
- **Radix primitive support**: Color scales and component tokens
- **Theme variants**: Light, Dark, and Stealth Ops with automatic switching

### 4. CSS Custom Property Fallbacks
- **Light theme**: Clean, modern color palette with subtle glassmorphism
- **Dark theme**: High-contrast dark mode with enhanced glass effects
- **Stealth Ops theme**: Tactical green/black theme with minimal blur and sharp edges
- All themes support graceful fallbacks and accessibility standards

## 📁 File Structure

```
src/theme/
├── index.ts          # Main exports
├── theme.ts          # Core design tokens and theme definitions
├── utils.ts          # Theme utilities and helper functions
└── README.md         # This documentation
```

## 🚀 Usage Examples

### Typography Classes

```tsx
// Use semantic typography classes
<h1 className="h1">Main Heading</h1>
<p className="body-lg">Large body text</p>
<p className="caption">LABEL TEXT</p>
<code className="code">inline code</code>
```

### Color Tokens in Tailwind

```tsx
// Use design token colors directly
<div className="bg-primary-500 text-primary-50">Primary button</div>
<div className="bg-success-100 text-success-900">Success message</div>
<div className="bg-glass-background text-contrast-high">Glass card</div>
```

### Component Utilities

```tsx
// Pre-built component classes
<button className="btn-primary">Primary Button</button>
<div className="card-glass">Glass Card</div>
<input className="input-field" />
<span className="badge-default">Badge</span>
```

### Theme Management

```tsx
import { applyTheme, getCurrentTheme, toggleTheme } from '@/theme';

// Apply specific theme
applyTheme('dark');

// Toggle between light/dark
const newTheme = toggleTheme();

// Get current theme
const current = getCurrentTheme();
```

### Design Token Access

```tsx
import { designTokens, getColorToken } from '@/theme';

// Access design tokens directly
const primaryColor = designTokens.colors.primary['500'];
const spacing = designTokens.spacing['4'];

// Get tokens with fallbacks
const tokenColor = getColorToken('primary.500', '#2563eb');
```

## 🎨 Theme Variants

### Light Theme
- Clean, modern aesthetic
- Subtle glassmorphism effects
- High contrast for accessibility
- Professional color palette

### Dark Theme  
- Deep, rich backgrounds
- Enhanced glass effects with stronger blur
- Maintained contrast ratios
- Optimized for low-light environments

### Stealth Ops Theme
- Tactical black/green color scheme
- High-visibility green accents (`#00ff00`)
- Minimal blur effects (2px)
- Sharp, minimal border radius (0.125rem)
- Monospace typography for technical feel

## 🔧 Customization

### Adding New Colors

```typescript
// In theme.ts, extend the designTokens.colors object
export const designTokens = {
  colors: {
    // ... existing colors
    brand: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      950: '#0c4a6e'
    }
  }
}
```

### Custom Typography Scale

```css
/* In globals.css @layer components */
.heading-custom {
  @apply text-2xl font-bold leading-tight tracking-tight;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  line-height: 1.2;
}
```

### Theme-Specific Styles

```css
/* Light theme specific */
:root {
  --custom-property: #ffffff;
}

/* Dark theme specific */
.dark {
  --custom-property: #000000;
}

/* Stealth ops specific */
.stealth-ops {
  --custom-property: #00ff00;
}
```

## 🎯 Benefits

1. **Consistent Design Language**: All components use the same design tokens
2. **Theme Flexibility**: Easy switching between light, dark, and tactical themes  
3. **Developer Experience**: Type-safe tokens with autocomplete
4. **Accessibility**: WCAG-compliant contrast ratios across all themes
5. **Performance**: CSS custom properties for runtime theme switching
6. **Maintainability**: Centralized token management
7. **Figma Integration**: Direct mapping from design variables

## 🧪 Testing

The theme system includes utilities for testing:

```tsx
import { isAccessibleColorCombination } from '@/theme';

// Test color contrast
const isAccessible = isAccessibleColorCombination('#ffffff', '#000000', 'AA');
```

## 📱 Responsive Design

All typography and spacing utilities include responsive scaling:

```css
/* Automatic responsive scaling with clamp() */
.h1 {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
}
```

## 🔄 Migration Guide

From the previous system:

1. Replace hardcoded colors with design token classes
2. Use semantic typography classes instead of direct Tailwind utilities
3. Leverage glassmorphic component classes for consistent effects
4. Update theme switching to use the new theme utilities

## 🎉 Deliverable Status

✅ **ST-032: Design-token implementation** - **COMPLETE**

- ✅ Migrated color tokens to Tailwind `theme.extend.colors`
- ✅ Introduced `@layer components` for typography utilities
- ✅ Created `theme.ts` mapping design tokens → shadcn/ui + Radix primitives
- ✅ Added CSS custom-property fallbacks for theming (light/dark/stealth-ops)
- ✅ Full Figma design variable integration
- ✅ Type-safe theme management utilities
- ✅ Accessibility and responsive design support
