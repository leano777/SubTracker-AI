# Testing Documentation

This directory contains the comprehensive test suite for the SubTracker AI application.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Performance Testing](#performance-testing)
- [Coverage Requirements](#coverage-requirements)
- [Troubleshooting](#troubleshooting)

## Overview

The test suite is built using **Vitest** as the test runner and **React Testing Library** for component testing. The testing strategy follows industry best practices with a focus on:

- **Unit Testing**: Testing individual hooks, utilities, and components in isolation
- **Integration Testing**: Testing complete user flows and component interactions
- **Performance Testing**: Using React Profiler to catch performance regressions
- **Coverage Tracking**: Maintaining high code coverage with meaningful tests

## Test Structure

```
src/test/
├── README.md              # This documentation
├── setup.ts              # Global test setup and configuration
├── utils.tsx             # Shared testing utilities and mocks
├── hooks/                # Unit tests for React hooks
│   ├── useDataManagement.test.ts
│   └── ...
├── contexts/             # Unit tests for React contexts
│   ├── AuthContext.test.tsx
│   └── ...
├── integration/          # Integration tests
│   ├── AppFlow.test.tsx
│   └── ...
└── performance/          # Performance regression tests
    ├── PerformanceRegression.test.tsx
    └── ...
```

## Running Tests

### Development Commands

```bash
# Run tests in watch mode (development)
npm run test

# Run all tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI (Vitest UI)
npm run test:ui

# Run specific test categories
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:performance   # Performance tests only
```

### CI Commands

```bash
# Full CI test suite with coverage and reporting
npm run test:ci

# Quality gate check (type-check + lint + tests)
npm run quality:check

# Complete CI pipeline
npm run ci:test
```

## Test Categories

### 1. Unit Tests (`src/test/hooks/`, `src/test/contexts/`)

**Purpose**: Test individual functions, hooks, and components in isolation.

**Examples**:
- `useDataManagement.test.ts`: Tests data loading, caching, sync operations
- `AuthContext.test.tsx`: Tests authentication state management

**Key Features**:
- Mock external dependencies
- Test edge cases and error conditions  
- Validate data transformations and migrations
- Test performance characteristics

### 2. Integration Tests (`src/test/integration/`)

**Purpose**: Test complete user workflows and component interactions.

**Examples**:
- `AppFlow.test.tsx`: Tests navigation, form submissions, data persistence

**Key Features**:
- Test real user interactions
- Validate end-to-end workflows
- Test responsive design adaptations
- Verify accessibility compliance

### 3. Performance Tests (`src/test/performance/`)

**Purpose**: Prevent performance regressions using React Profiler.

**Key Features**:
- Render time benchmarks
- Memory usage monitoring
- Component re-render optimization
- Large dataset handling performance

## Writing Tests

### Test Utilities

Use the utilities provided in `src/test/utils.tsx`:

```typescript
import {
  createMockSubscription,
  createMockPaymentCard,
  renderWithProviders,
  createHookWrapper
} from '../utils';

// Mock data generation
const subscription = createMockSubscription({
  name: 'Test Service',
  price: 9.99
});

// Component testing with providers
renderWithProviders(<MyComponent />, {
  authValue: { isAuthenticated: true }
});

// Hook testing
const { result } = renderHook(() => useMyHook(), {
  wrapper: createHookWrapper({ authValue: {} })
});
```

### Best Practices

1. **Arrange-Act-Assert Pattern**:
```typescript
it('should update subscription price', async () => {
  // Arrange
  const initialSub = createMockSubscription({ price: 10.99 });
  
  // Act
  const updatedSub = { ...initialSub, price: 12.99 };
  
  // Assert
  expect(updatedSub.price).toBe(12.99);
});
```

2. **Descriptive Test Names**:
```typescript
// Good
it('should migrate legacy subscription data format to new schema')

// Bad  
it('should migrate data')
```

3. **Test Both Happy Path and Edge Cases**:
```typescript
describe('useDataManagement', () => {
  it('should load data successfully when authenticated');
  it('should handle network errors gracefully');
  it('should migrate legacy data format');
  it('should validate data integrity');
});
```

4. **Use Custom Matchers**:
```typescript
expect(subscription).toHaveValidSubscriptionData();
expect(price).toBeValidCurrency();
```

### Mocking Guidelines

- **Mock external services**: Supabase, localStorage, network calls
- **Don't mock the code under test**: Test real implementations
- **Use factory functions**: Create consistent mock data
- **Reset mocks**: Clear state between tests

## CI/CD Integration

### GitHub Actions Workflow

The test suite runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### Pipeline Stages

1. **Quality Gates**: Type checking, linting, formatting
2. **Unit Tests**: Fast-running isolated tests
3. **Integration Tests**: Full application workflow tests
4. **Performance Tests**: Regression detection
5. **Coverage Analysis**: Code coverage reporting
6. **Build Verification**: Ensure application builds correctly

### Coverage Requirements

- **Global Coverage**: 70% minimum across all metrics
- **Critical Paths**: 90%+ coverage for core business logic
- **Hooks**: 85%+ coverage for custom React hooks
- **Utils**: 80%+ coverage for utility functions

## Performance Testing

### React Profiler Integration

Performance tests use React's built-in Profiler to measure:
- **Render Time**: Initial and update render duration
- **Memory Usage**: Heap size monitoring
- **Re-render Frequency**: Component update patterns

### Performance Budgets

```typescript
const PERFORMANCE_BASELINES = {
  initialRender: 100,    // ms - First render budget
  dataUpdate: 50,        // ms - Data update budget  
  searchFilter: 30,      // ms - Search operations
  componentMount: 20,    // ms - Component mounting
  listScroll: 16,        // ms - 60fps scrolling
};
```

### Large Dataset Testing

Performance tests include scenarios with:
- 1000+ subscriptions for data management
- 2000+ items for list virtualization
- Rapid user interactions (100+ events)
- Memory leak detection

## Debugging Tests

### Common Issues

1. **Tests timeout**: Increase timeout or check for infinite loops
2. **Mock not working**: Verify mock is imported before the tested module
3. **Async issues**: Use `waitFor` and proper async/await patterns
4. **Component not found**: Check if component rendered correctly

### Debug Commands

```bash
# Run specific test file
npx vitest run src/test/hooks/useDataManagement.test.ts

# Debug with console output
npx vitest run --reporter=verbose

# Run with UI for debugging
npm run test:ui
```

### Visual Debugging

```typescript
import { screen } from '@testing-library/react';

// Debug what's rendered
screen.debug();

// Debug specific element
screen.debug(screen.getByRole('button'));
```

## Contributing to Tests

### Adding New Tests

1. **Unit Tests**: Add to appropriate category folder
2. **Integration Tests**: Add to `integration/` folder
3. **Performance Tests**: Add to `performance/` folder
4. **Update Documentation**: Keep this README current

### Test Naming Conventions

- **Files**: `*.test.ts` or `*.test.tsx`
- **Describes**: Feature or component name
- **Test Cases**: "should [expected behavior] when [condition]"

### Code Review Checklist

- [ ] Tests cover happy path and edge cases
- [ ] Mock usage is appropriate
- [ ] Test names are descriptive
- [ ] No hardcoded values where avoidable
- [ ] Performance impact considered
- [ ] Accessibility tested where applicable

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Guide](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Performance Testing Guide](https://react.dev/reference/react/Profiler)

---

For questions or suggestions about the testing strategy, please reach out to the development team.
