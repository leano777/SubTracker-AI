# ADR-002: Component Architecture Pattern

## Status
Accepted

## Context
The SubTracker AI application has grown to include complex UI components for subscription management, dashboard analytics, budget tracking, and more. We need a consistent component architecture pattern that:

1. Promotes reusability and maintainability
2. Ensures consistent styling and behavior
3. Provides clear separation between UI and business logic
4. Supports accessibility requirements
5. Enables efficient testing strategies
6. Scales with application growth

The application initially had inconsistent component patterns leading to code duplication and maintenance issues.

## Decision
We will adopt a layered component architecture with clear separation of concerns:

### 1. UI Components Layer (`/components/ui/`)
- **Purpose**: Reusable, unstyled, headless components
- **Technology**: shadcn/ui based on Radix UI primitives
- **Responsibility**: Pure UI behavior, accessibility, keyboard navigation
- **Examples**: Button, Card, Dialog, Input, Select

### 2. Feature Components Layer (`/components/[feature]/`)
- **Purpose**: Business logic components for specific features
- **Organization**: Grouped by feature domain (dashboard, subscription, etc.)
- **Responsibility**: Data fetching, business rules, feature-specific behavior
- **Examples**: SubscriptionCard, DashboardChart, BudgetTracker

### 3. Layout Components Layer (`/components/layout/`)
- **Purpose**: Application structure and navigation components
- **Responsibility**: Page layout, navigation, routing
- **Examples**: AppHeader, Sidebar, MainLayout

### 4. Common/Shared Components Layer (`/components/common/`)
- **Purpose**: Cross-feature shared components
- **Responsibility**: Common behaviors that span multiple features
- **Examples**: LoadingSpinner, ErrorBoundary, EmptyState

## Consequences

### Positive
- **Consistency**: Standardized component patterns across the application
- **Reusability**: UI components can be reused across different features
- **Maintainability**: Clear boundaries make components easier to maintain
- **Accessibility**: Built-in accessibility through Radix UI primitives
- **Testing**: Each layer can be tested independently with appropriate strategies
- **Performance**: Tree-shaking and code splitting benefits
- **Developer Experience**: IntelliSense and type safety with TypeScript

### Negative
- **Initial Learning Curve**: Developers need to understand the layered architecture
- **Potential Over-Abstraction**: Simple components might become over-engineered
- **Bundle Size**: Additional abstraction layers add some overhead

### Neutral
- **Migration Effort**: Existing components need to be refactored to fit the pattern
- **Documentation**: Requires comprehensive documentation for patterns

## Alternatives Considered

### Atomic Design Pattern
- **Pros**: Well-established methodology, clear hierarchy
- **Cons**: Too rigid for our use case, unclear boundaries between atoms/molecules

### Container/Presentational Pattern
- **Pros**: Clear separation of data and presentation
- **Cons**: Outdated pattern with modern React hooks, too restrictive

### Feature-Based Organization Only
- **Pros**: Colocated related code, easy to find components
- **Cons**: Code duplication, no reusable UI library, inconsistent patterns

## Implementation Notes

### Component Structure Template

#### UI Component Example
```typescript
// /components/ui/button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const buttonVariants = cva(/* styles */);

interface ButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
          VariantProps<typeof buttonVariants> {
  // Additional props
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
```

#### Feature Component Example
```typescript
// /components/subscription/SubscriptionCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscriptions } from '@/hooks/useSubscriptions';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (id: string) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete
}) => {
  // Component logic here
  return (
    <Card>
      <CardHeader>
        <CardTitle>{subscription.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
};
```

### Styling Approach
- **Base Styles**: Tailwind CSS utility classes
- **Component Variants**: class-variance-authority (cva) for component variants
- **Consistency**: Design tokens through CSS custom properties
- **Responsive**: Mobile-first responsive design patterns

### Props Patterns
- **Composition**: Use children prop for flexible content
- **Polymorphism**: Support `as` prop for different HTML elements when appropriate
- **Forwarding**: Forward refs for proper form integration
- **Variants**: Use cva for style variants instead of boolean props

### Performance Patterns
- **Lazy Loading**: Code-split feature components
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large lists of subscription data

### Accessibility Requirements
- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Logical focus flow, focus trapping in modals
- **Color Contrast**: WCAG AA compliance for all text and interactive elements

### Testing Strategy

#### UI Components (Unit Tests)
- Test component variants and props
- Test keyboard navigation and accessibility
- Test component composition patterns

#### Feature Components (Integration Tests)
- Test with real data scenarios
- Test user interactions and state changes
- Test error states and loading states

#### Visual Testing
- Storybook for component documentation and testing
- Visual regression tests for consistent UI

### File Organization
```
src/components/
├── ui/                     # Reusable UI primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── index.ts           # Barrel exports
├── subscription/          # Subscription feature components
│   ├── SubscriptionCard.tsx
│   ├── SubscriptionForm.tsx
│   ├── SubscriptionList.tsx
│   └── index.ts
├── dashboard/             # Dashboard feature components
│   ├── DashboardChart.tsx
│   ├── StatsCard.tsx
│   └── index.ts
├── layout/                # Layout components
│   ├── AppHeader.tsx
│   ├── Sidebar.tsx
│   └── MainLayout.tsx
└── common/               # Shared components
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    └── EmptyState.tsx
```

### Design System Integration
- **Typography**: Consistent font scales and weights
- **Spacing**: Standardized spacing scale using Tailwind
- **Colors**: Semantic color system with light/dark mode support
- **Icons**: Lucide React icons for consistency
- **Animations**: Subtle animations using Tailwind and CSS transitions

### Component Documentation
- **Storybook**: Interactive documentation for all components
- **JSDoc**: Comprehensive prop documentation
- **Usage Examples**: Code examples in documentation
- **Design Guidelines**: Visual guidelines for component usage

## References
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Component Architecture Best Practices](https://react.dev/learn/thinking-in-react)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Original Component Issues](../../DEBUGGING_PLAN.md#performance-bottleneck-analysis)
