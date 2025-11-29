# 📁 SubTracker AI - File Structure Guide

## 🎯 Overview
This document outlines the reorganized file structure for the SubTracker AI application, designed for maintainability, scalability, and easy navigation for development teams.

## 📂 Directory Structure

```
src/
├── features/              # Feature-based modules (domain-driven)
│   ├── auth/             # Authentication & authorization
│   │   ├── components/   # Auth-specific components
│   │   ├── hooks/        # Auth hooks (useAuth, usePermissions)
│   │   ├── services/     # Auth API services
│   │   ├── stores/       # Auth state management
│   │   └── types/        # Auth type definitions
│   │
│   ├── dashboard/        # Dashboard feature
│   │   ├── components/   # Dashboard widgets and cards
│   │   ├── hooks/        # Dashboard data hooks
│   │   └── utils/        # Dashboard calculations
│   │
│   ├── income/           # Income management
│   │   ├── components/   
│   │   │   ├── IncomeSetupWizard.tsx
│   │   │   ├── IncomeWizardSteps.tsx
│   │   │   └── PayInputForm.tsx
│   │   ├── hooks/        # useIncome, usePayCalculations
│   │   ├── services/     # Income API calls
│   │   └── utils/        # Pay frequency calculations
│   │
│   ├── budget/           # Budget pods & allocation
│   │   ├── components/
│   │   │   ├── BudgetPodsTab.tsx
│   │   │   ├── BudgetPods.tsx
│   │   │   ├── PodAllocationManager.tsx
│   │   │   └── PodCard.tsx
│   │   ├── hooks/        # useBudget, useAllocations
│   │   ├── services/     # Budget API services
│   │   └── utils/        # Allocation algorithms
│   │
│   ├── subscriptions/    # Subscription tracking
│   │   ├── components/   # Subscription forms, lists, cards
│   │   ├── hooks/        # useSubscriptions
│   │   ├── services/     # Subscription CRUD
│   │   └── utils/        # Renewal calculations
│   │
│   ├── investments/      # Investment portfolio
│   │   ├── components/   # Portfolio views
│   │   ├── hooks/        # usePortfolio
│   │   └── services/     # Market data APIs
│   │
│   ├── settings/         # User settings & preferences
│   │   ├── components/   # Settings forms
│   │   ├── hooks/        # useSettings
│   │   └── types/        # Settings schemas
│   │
│   └── onboarding/       # New user onboarding
│       ├── components/   # Onboarding flow steps
│       ├── hooks/        # useOnboarding
│       └── utils/        # Progress tracking
│
├── shared/               # Shared/common code
│   ├── components/       # Reusable components
│   │   ├── ui/          # Base UI components (existing)
│   │   ├── layout/      # Layout components
│   │   │   ├── AppShell.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── feedback/    # Notifications, alerts, toasts
│   │
│   ├── hooks/           # Global hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── utils/           # Global utilities
│   │   ├── cn.ts        # Class name utility
│   │   ├── formatters.ts # Currency, date formatters
│   │   └── validators.ts # Input validators
│   │
│   └── types/           # Global type definitions
│       ├── index.ts     # Common types
│       └── api.ts       # API response types
│
├── core/                # Core application logic
│   ├── auth/           # Auth context & providers
│   ├── store/          # Global state management
│   ├── api/            # API client setup
│   └── config/         # App configuration
│
├── pages/              # Main page components
│   ├── DashboardPage.tsx
│   ├── BudgetPage.tsx
│   ├── SubscriptionsPage.tsx
│   ├── InvestmentsPage.tsx
│   └── SettingsPage.tsx
│
├── styles/             # Global styles
│   └── globals.css
│
├── App.tsx            # Main app component
├── main.tsx          # Entry point
└── vite-env.d.ts     # TypeScript declarations
```

## 🏗️ Migration Strategy

### Phase 1: Create New Structure (Current)
1. Create feature directories
2. Move related components together
3. Update import paths

### Phase 2: Refactor Components
1. Group by feature domain
2. Extract shared components
3. Consolidate duplicate code

### Phase 3: Optimize Imports
1. Create barrel exports (index.ts)
2. Set up path aliases
3. Remove circular dependencies

## 📦 Feature Module Structure

Each feature module follows this pattern:

```
feature-name/
├── components/        # Feature-specific components
├── hooks/            # Feature-specific hooks
├── services/         # API/external services
├── stores/           # Feature state (if needed)
├── utils/            # Feature utilities
├── types/            # Feature type definitions
└── index.ts          # Public API (barrel export)
```

## 🎯 Benefits

1. **Feature Isolation**: Each feature is self-contained
2. **Easy Navigation**: Find files by feature/domain
3. **Clear Dependencies**: Features explicitly import from shared
4. **Scalable**: Easy to add new features
5. **Team Friendly**: Multiple developers can work on different features
6. **Testing**: Feature-specific tests stay with features

## 🔄 Import Examples

### Before (Scattered):
```typescript
import { Button } from '../../components/ui/button';
import { useAuth } from '../../../hooks/useAuth';
import { formatCurrency } from '../../../../utils/helpers';
```

### After (Organized):
```typescript
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatCurrency } from '@/shared/utils/formatters';
```

## 📝 Naming Conventions

- **Components**: PascalCase (e.g., `BudgetPodCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useIncome.ts`)
- **Utils**: camelCase (e.g., `calculateTax.ts`)
- **Types**: PascalCase for types/interfaces (e.g., `BudgetPod.ts`)
- **Services**: camelCase with 'Service' suffix (e.g., `authService.ts`)

## 🚀 Quick Start for Developers

1. **Finding a component**: Check the feature folder first, then shared
2. **Adding new feature**: Create a new folder under `/features`
3. **Adding shared component**: Place in `/shared/components`
4. **Feature-specific logic**: Keep within the feature folder
5. **Global utilities**: Place in `/shared/utils`

## 📊 Current Status

- [x] File structure documented
- [ ] Income feature organized
- [ ] Budget feature organized
- [ ] Dashboard feature organized
- [ ] Shared components extracted
- [ ] Path aliases configured
- [ ] Old files cleaned up

---

*This structure promotes maintainability, scalability, and developer productivity.*