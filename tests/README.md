# ST-040: Visual/E2E Test Suite

## Overview

This document describes the comprehensive Visual Regression and End-to-End (E2E) testing implementation for the SubTracker AI application, completed as part of **Phase 10** development.

## 📋 Features

### ✅ Visual Regression Testing
- **Playwright + Storybook integration** for component-level screenshot comparisons
- **0.1% threshold** for visual differences (as specified in requirements)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Responsive design testing (Mobile, Tablet, Desktop viewports)
- Theme comparison (Light vs Dark mode)
- Component state testing (hover, focus, disabled, etc.)

### ✅ End-to-End Testing
- **Cypress flows** for critical user journeys:
  - Authentication (login/logout)
  - Add subscription functionality
  - Edit budget workflows
  - Subscription management (CRUD operations)
  - Budget tracking and alerts

### ✅ CI/CD Integration
- **GitHub Actions workflow** with PR-based visual testing
- **Automatic failure** when visual diff exceeds 0.1%
- **Artifact storage** for test results and screenshots
- **PR comments** with test results summary

## 🚀 Getting Started

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run visual:setup
```

### Running Tests Locally

#### Visual Regression Tests
```bash
# Run all visual tests
npm run test:visual

# Run with headed browser (see tests in action)
npm run test:visual:headed

# Debug mode (step through tests)
npm run test:visual:debug

# Update baseline screenshots
npm run test:visual:update
```

#### E2E Tests
```bash
# Run E2E tests in headless mode
npm run test:e2e

# Open Cypress Test Runner
npm run test:e2e:open

# Run with headed browser
npm run test:e2e:headed
```

#### Combined Testing
```bash
# Run both visual and E2E tests
npm run test:all-visual
```

## 🏗️ Architecture

### Directory Structure
```
tests/
├── visual/                 # Playwright visual tests
│   ├── storybook-visual.spec.ts    # Storybook component tests
│   └── app-visual.spec.ts          # Application page tests
├── e2e/                    # Cypress E2E tests
│   ├── auth.cy.ts                  # Authentication flows
│   ├── subscriptions.cy.ts        # Subscription management
│   ├── budget.cy.ts               # Budget functionality
│   ├── support/
│   │   ├── commands.ts            # Custom Cypress commands
│   │   └── e2e.ts                # Global test configuration
│   └── fixtures/
│       └── subscriptions.json     # Test data
├── setup/                  # Test setup and utilities
│   └── global-setup.ts            # Playwright global setup
└── README.md              # This documentation
```

### Configuration Files
- `playwright.config.ts` - Playwright configuration with 0.1% threshold
- `cypress.config.ts` - Cypress E2E test configuration
- `.github/workflows/test.yml` - CI/CD pipeline configuration

## 🎯 Test Coverage

### Critical User Paths Covered

#### 1. Authentication Flow (`tests/e2e/auth.cy.ts`)
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Logout functionality
- ✅ Session persistence
- ✅ Landing page accessibility

#### 2. Subscription Management (`tests/e2e/subscriptions.cy.ts`)
- ✅ View existing subscriptions
- ✅ Add new subscription
- ✅ Edit subscription details
- ✅ Delete subscription
- ✅ Search and filter subscriptions
- ✅ Category management
- ✅ Renewal notifications

#### 3. Budget Management (`tests/e2e/budget.cy.ts`)
- ✅ View current budget information
- ✅ Set monthly budget
- ✅ Budget vs spending comparison
- ✅ Budget limit warnings
- ✅ Category-based spending breakdown
- ✅ Budget history and trends
- ✅ Budget calculations accuracy

### Visual Regression Coverage

#### Component Testing (Storybook)
- ✅ Button variants (primary, secondary, sizes)
- ✅ Input components and states
- ✅ Headers and navigation
- ✅ Full page layouts
- ✅ Form validation states
- ✅ Modal dialogs

#### Application Testing
- ✅ Landing page layout
- ✅ Dashboard (authenticated state)
- ✅ Subscription list views
- ✅ Budget overview sections
- ✅ Responsive layouts (Mobile/Tablet/Desktop)
- ✅ Theme switching (Light/Dark)
- ✅ Empty states
- ✅ Loading states

## ⚙️ Configuration

### Visual Testing Threshold
The visual regression tests are configured with a **0.1% threshold** as specified in the requirements:

```typescript
// playwright.config.ts
expect: {
  toHaveScreenshot: { 
    threshold: 0.001, // 0.1% = 0.001
    mode: 'strict',
    animations: 'disabled'
  }
}
```

### Cross-Browser Testing
Tests run across multiple browsers:
- **Desktop**: Chrome, Firefox, Safari (WebKit)
- **Mobile**: Chrome Mobile, Safari Mobile

### Responsive Breakpoints
- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1280x720 (Standard Desktop)

## 🚦 CI/CD Pipeline

### GitHub Actions Workflow

The pipeline runs on **Pull Requests** and includes:

1. **Code Quality Checks** (ESLint, TypeScript, Prettier)
2. **Unit & Integration Tests**
3. **Visual Regression Tests**
4. **E2E Tests** (Chrome & Firefox)
5. **Automated PR Comments** with results

### Failure Conditions
Tests will fail CI if:
- Visual differences exceed 0.1% threshold
- Any E2E test fails
- Critical user flows are broken
- Component visual consistency is broken

### Artifacts
All test runs produce downloadable artifacts:
- Screenshots and videos
- Test reports (HTML, JSON, JUnit)
- Coverage reports
- Visual diff images

## 🔧 Custom Commands & Utilities

### Cypress Custom Commands
```typescript
// Available custom commands
cy.getByTestId('element-id')     // Get by test ID
cy.setupMockData()               // Setup test data
cy.login(email, password)        // Authenticate user
cy.addSubscription(data)         // Add subscription
cy.editBudget(amount)           // Edit budget amount
```

### Playwright Utilities
- Global setup for app initialization
- Dynamic content hiding for consistent screenshots
- Cross-browser viewport configuration
- Animation disabling for stable screenshots

## 📊 Reporting

### Test Reports
- **HTML Reports**: Visual diff comparisons with before/after images
- **JUnit XML**: CI-friendly test result format
- **JSON Reports**: Structured test data for analysis

### PR Integration
Automated comments on Pull Requests include:
- ✅/❌ Visual regression test status
- ✅/❌ E2E test status
- 📋 Test coverage summary
- 🔗 Links to downloadable artifacts

## 🛠️ Troubleshooting

### Common Issues

#### Visual Test Failures
```bash
# Update baseline screenshots if changes are intentional
npm run test:visual:update

# Run in headed mode to see what's happening
npm run test:visual:headed
```

#### E2E Test Failures
```bash
# Open Cypress runner to debug interactively
npm run test:e2e:open

# Check application logs and network requests
# Ensure test data is properly setup
```

#### CI/CD Issues
- Ensure all dependencies are installed in CI
- Check that test servers are properly started
- Verify environment variables are set correctly

### Performance Tips
- Visual tests run faster with animations disabled
- Use specific selectors instead of broad queries
- Mock external API calls for consistent testing
- Clean up test data between runs

## 🏷️ Test Data Management

### Mock Data
Tests use consistent mock data from:
- `tests/e2e/fixtures/subscriptions.json`
- localStorage setup in custom commands
- Isolated test environment per spec

### Test Isolation
- Each test runs in a clean environment
- Local storage is cleared between tests
- Mock data is consistent across runs
- No cross-test dependencies

## 📈 Future Enhancements

Potential improvements for the test suite:

### Enhanced Visual Testing
- **Percy integration** for advanced visual diffing
- **Chromatic** for Storybook visual testing
- **Cross-device testing** on real devices
- **Accessibility visual testing**

### Advanced E2E Testing
- **API testing** with network mocking
- **Performance testing** with Lighthouse
- **Database state management**
- **Multi-user workflow testing**

### CI/CD Improvements
- **Parallel test execution**
- **Test result dashboards**
- **Slack/Teams notifications**
- **Automated screenshot updates**

---

## 📄 Deliverable Status

✅ **ST-040 "Visual/E2E test suite"** - **COMPLETED**

### Implementation Summary:
- ✅ Playwright + Storybook screenshot diff tests integrated
- ✅ Cypress flows for critical paths (auth, add sub, edit budget)
- ✅ CI step on PR that fails if visual diff > 0.1%
- ✅ Comprehensive test coverage for subscription tracking app
- ✅ Cross-browser and responsive design testing
- ✅ Automated PR feedback with test results

### Usage:
```bash
# Quick start - run all visual tests
npm run test:visual

# Run E2E tests for critical paths
npm run test:e2e

# Setup for first time
npm run visual:setup

# View test reports
npm run visual:report
```

This implementation provides a robust foundation for maintaining visual consistency and ensuring critical user flows work correctly across all supported browsers and devices.
