# Contributing to SubTracker AI

Thank you for considering contributing to SubTracker AI! This document provides comprehensive guidelines and instructions for contributing to this project.

## 🤝 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainer-email].

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git**
- **Supabase account** (for backend features)
- **Code editor** (VS Code recommended with extensions listed below)

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens"
  ]
}
```

### Setting up the Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/subtracker-ai.git
   cd subtracker-ai
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/subtracker-ai.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```
6. **Configure Supabase** (see [README.md](./README.md) for details)
7. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📝 Contribution Guidelines

### Git Workflow

We follow a **GitHub Flow** approach:

1. **Sync with upstream**:
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

#### Commit Types
- `feat:` - New features or enhancements
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semi-colons, etc.)
- `refactor:` - Code refactoring without functionality changes
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process, dependencies, or auxiliary tool changes
- `ci:` - CI/CD pipeline changes
- `revert:` - Reverting previous commits

#### Commit Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Examples
```bash
# Feature with scope
feat(dashboard): add subscription analytics chart

# Bug fix with body
fix: resolve memory leak in subscription sync

Fixed infinite re-render cycle in useDataManagement hook
by properly memoizing callback dependencies.

Closes #123

# Breaking change
feat!: migrate to Supabase v3 API

BREAKING CHANGE: API endpoints have changed, requires
environment variable updates.
```

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `perf/description` - Performance improvements
- `test/description` - Test improvements

**Examples:**
- `feature/ai-insights-dashboard`
- `fix/subscription-sync-error`
- `docs/deployment-guide`
- `refactor/hooks-optimization`

## 🏗 Coding Standards

### TypeScript Guidelines

1. **Use strict TypeScript**:
   ```typescript
   // ✅ Good
   interface Subscription {
     id: string;
     name: string;
     cost: number;
     nextPayment: Date;
   }
   
   // ❌ Avoid
   const subscription: any = {...};
   ```

2. **Prefer interfaces over types** for object shapes:
   ```typescript
   // ✅ Good
   interface UserSettings {
     theme: 'light' | 'dark';
     currency: string;
   }
   
   // ❌ Avoid (unless needed for unions)
   type UserSettings = {
     theme: 'light' | 'dark';
     currency: string;
   }
   ```

3. **Use proper typing for React components**:
   ```typescript
   // ✅ Good
   interface ButtonProps {
     children: React.ReactNode;
     onClick: () => void;
     variant?: 'primary' | 'secondary';
   }
   
   const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {
     return <button onClick={onClick} className={`btn-${variant}`}>{children}</button>;
   };
   ```

### React Guidelines

1. **Use functional components** with hooks
2. **Properly handle side effects**:
   ```typescript
   // ✅ Good
   useEffect(() => {
     const controller = new AbortController();
     
     fetchData(controller.signal)
       .then(setData)
       .catch(handleError);
     
     return () => controller.abort();
   }, []);
   ```

3. **Memoize expensive computations**:
   ```typescript
   const expensiveValue = useMemo(() => {
     return processLargeDataset(data);
   }, [data]);
   ```

4. **Use proper dependency arrays**:
   ```typescript
   // ✅ Good
   useEffect(() => {
     updateSubscriptions(userId);
   }, [userId]);
   
   // ❌ Avoid
   useEffect(() => {
     updateSubscriptions(user.id);
   }, [user]); // Object reference changes
   ```

### CSS/Styling Guidelines

1. **Use Tailwind CSS** utility classes
2. **Create component variants** with cva:
   ```typescript
   const buttonVariants = cva(
     "inline-flex items-center justify-center rounded-md text-sm font-medium",
     {
       variants: {
         variant: {
           default: "bg-primary text-primary-foreground hover:bg-primary/90",
           destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
         },
         size: {
           default: "h-10 px-4 py-2",
           sm: "h-9 rounded-md px-3",
           lg: "h-11 rounded-md px-8",
         },
       },
     }
   );
   ```

3. **Responsive design first**:
   ```tsx
   <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6">
   ```

### File Organization

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── dashboard/            # Dashboard-specific components
│   ├── subscription/         # Subscription-related components
│   └── common/              # Shared components
├── hooks/                   # Custom React hooks
├── utils/                   # Utility functions
├── types/                   # TypeScript type definitions
├── contexts/               # React contexts
├── styles/                 # Global styles
└── test/                   # Test files
```

### Naming Conventions

- **Files**: `kebab-case` (e.g., `subscription-card.tsx`)
- **Components**: `PascalCase` (e.g., `SubscriptionCard`)
- **Hooks**: `camelCase` starting with "use" (e.g., `useSubscriptions`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_ENDPOINTS`)
- **Variables/Functions**: `camelCase` (e.g., `handleSubmit`)

## 🧪 Testing Requirements

### Testing Strategy

1. **Unit Tests** - Test individual functions and components
2. **Integration Tests** - Test component interactions
3. **Performance Tests** - Test for memory leaks and performance regressions

### Writing Tests

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { SubscriptionCard } from './SubscriptionCard';

describe('SubscriptionCard', () => {
  it('should display subscription information', () => {
    const subscription = {
      id: '1',
      name: 'Netflix',
      cost: 15.99,
      nextPayment: new Date('2024-02-01')
    };
    
    render(<SubscriptionCard subscription={subscription} />);
    
    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('$15.99')).toBeInTheDocument();
  });
});
```

### Test Requirements

- **New features** must include unit tests
- **Bug fixes** must include regression tests
- **Components** should test user interactions
- **Hooks** should test all return values and side effects
- **Performance tests** for components with complex state

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:performance

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📋 Pull Request Checklist

### Before Submitting

- [ ] **Code Quality**
  - [ ] All TypeScript errors resolved
  - [ ] ESLint warnings addressed
  - [ ] Code formatted with Prettier
  - [ ] No console.log statements (unless intentional)
  - [ ] Follows established patterns and conventions

- [ ] **Testing**
  - [ ] Unit tests added for new functionality
  - [ ] All existing tests pass
  - [ ] Integration tests added if applicable
  - [ ] Performance tests added for complex features
  - [ ] Test coverage meets requirements (80%+)

- [ ] **Documentation**
  - [ ] README updated if needed
  - [ ] JSDoc comments added for complex functions
  - [ ] Type definitions are clear and complete
  - [ ] Breaking changes documented

- [ ] **Git History**
  - [ ] Commit messages follow conventional commits
  - [ ] Branch is up to date with main
  - [ ] No merge conflicts
  - [ ] Commits are logical and atomic

- [ ] **Feature Requirements**
  - [ ] Feature works across different screen sizes
  - [ ] Accessibility requirements met
  - [ ] Error handling implemented
  - [ ] Loading states handled
  - [ ] Works with/without authentication

### PR Description Template

```markdown
## 📝 Description
Brief description of changes

## 🔄 Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## 📸 Screenshots (if applicable)

## 📚 Documentation
- [ ] Documentation updated
- [ ] Breaking changes documented

## ✅ Checklist
- [ ] Self-review completed
- [ ] Code follows style guidelines
- [ ] Tests added and passing
- [ ] No new TypeScript errors
```

## 🐛 Reporting Bugs

Use our [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml) when reporting bugs.

### Bug Report Should Include:

- **Clear description** of the issue
- **Steps to reproduce** (minimal reproduction case)
- **Expected vs actual behavior**
- **Environment details** (Browser, OS, Node version)
- **Screenshots/videos** if applicable
- **Error messages** from console
- **Related code** snippets if relevant

## 💡 Feature Requests

Use our [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml) for new feature suggestions.

### Feature Request Should Include:

- **Problem description** - What problem does this solve?
- **Proposed solution** - How should it work?
- **Alternative solutions** - Other approaches considered?
- **User stories** - Who benefits and how?
- **Design considerations** - UI/UX mockups if applicable
- **Implementation notes** - Technical considerations

## 📚 Project Architecture

### File Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── dashboard/            # Dashboard-specific components
│   │   ├── DashboardTab.tsx
│   │   ├── Analytics.tsx
│   │   └── ...
│   ├── subscription/         # Subscription management
│   │   ├── SubscriptionCard.tsx
│   │   ├── SubscriptionForm.tsx
│   │   └── ...
│   └── common/              # Shared application components
│       ├── AppHeader.tsx
│       ├── Navigation.tsx
│       └── ...
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useDataManagement.ts
│   └── ...
├── utils/                   # Utility functions
│   ├── api.ts
│   ├── dateUtils.ts
│   ├── supabase/
│   └── ...
├── types/                   # TypeScript definitions
│   ├── subscription.ts
│   ├── constants.ts
│   └── ...
├── contexts/               # React contexts
│   └── AuthContext.tsx
├── styles/                 # Global styles
│   └── globals.css
└── test/                   # Test files
    ├── components/
    ├── hooks/
    ├── utils/
    └── setup.ts
```

### State Management

- **Zustand** for global state
- **React Context** for theme and auth
- **Local state** for component-specific data
- **React Query/SWR** for server state (if needed)

### Data Flow

1. **Components** → **Hooks** → **Utils/API**
2. **Supabase** ↔ **API Utils** ↔ **Custom Hooks** ↔ **Components**
3. **Authentication** → **Context** → **Protected Routes**

## 🔧 Development Scripts

### Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking
npm run quality:check    # Run all quality checks

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Open Vitest UI
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests
npm run test:performance # Run performance tests
npm run test:ci          # Run tests for CI

# Git Hooks
npm run precommit        # Pre-commit checks
```

### Development Workflow

1. **Start development**: `npm run dev`
2. **Make changes** following guidelines
3. **Run quality checks**: `npm run quality:check`
4. **Run tests**: `npm run test:run`
5. **Commit changes**: Follow conventional commits
6. **Push and create PR**

## ❓ Getting Help

### Resources

1. **Project Documentation**:
   - [README.md](./README.md) - Setup and overview
   - [DEBUGGING_PLAN.md](./DEBUGGING_PLAN.md) - Troubleshooting
   - [Project Management](./project-management/) - Development workflow

2. **External Resources**:
   - [React Documentation](https://react.dev/)
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/)
   - [Tailwind CSS](https://tailwindcss.com/docs)
   - [Supabase Documentation](https://supabase.com/docs)

3. **Community Support**:
   - Check existing [Issues](https://github.com/yourusername/subtracker-ai/issues)
   - Create new issue with proper template
   - Join discussions in repository

### Questions Not Covered?

If you have questions that aren't covered in this guide:

1. **Search existing issues** for similar questions
2. **Create a discussion** for general questions
3. **Create an issue** for bugs or specific problems
4. **Reach out to maintainers** for urgent matters

## 🏆 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for major contributions
- **GitHub contributors** graph
- **Special mentions** for significant improvements

### Contribution Types

- 💻 Code contributions
- 📖 Documentation improvements
- 🐛 Bug reports and fixes
- 💡 Feature suggestions
- 🎨 Design contributions
- 🧪 Testing improvements
- 📢 Community support

---

**Thank you for contributing to SubTracker AI! Every contribution helps make this project better for everyone.**

*For questions about this guide, please create an issue or reach out to the maintainers.*
