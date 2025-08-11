# SubTracker E2E Testing Suite

This comprehensive testing suite ensures the SubTracker application meets all functional, performance, and user experience requirements.

## 🎯 Testing Overview

### Test Requirements (Step 7)
1. **Cypress/Playwright script**: 
   - Load app with seed data
   - Click "Subscriptions" tab → assert card list visible
   - Click "Dashboard" tab → assert graph element visible
2. **Manual QA** on mobile viewport to ensure FAB menu closes and tab changes render instantly
3. **Regression checklist**: data editing, add subscription, sync, dark-mode toggle

## 🚀 Quick Start

### Prerequisites
```bash
# Ensure dependencies are installed
npm install

# Start the development server
npm run dev
```

### Run All Tests
```bash
# Execute comprehensive E2E test suite
node run-e2e-tests.js
```

### Run Specific Test Suites
```bash
# Cypress tests only
npm run test:e2e

# Playwright tests only
npm run test:visual

# Skip mobile tests (faster)
node run-e2e-tests.js --skip-mobile

# Include visual regression tests
node run-e2e-tests.js --include-visual
```

## 📂 Test Structure

```
tests/
├── e2e/                    # Cypress E2E tests
│   ├── app-navigation.cy.ts    # Core navigation & functionality tests
│   ├── subscriptions.cy.ts     # Existing subscription tests
│   └── support/                # Cypress helper functions
├── e2e-playwright/         # Playwright E2E tests
│   └── app-comprehensive.spec.ts # Comprehensive behavior tests
├── visual/                 # Visual regression tests
│   └── app-visual.spec.ts      # Existing visual tests
├── manual-qa/              # Manual testing checklists
│   └── mobile-checklist.md     # Mobile viewport testing guide
├── regression/             # Regression testing
│   └── regression-checklist.md # Comprehensive regression tests
└── setup/                  # Global test setup
    └── global-setup.ts         # Playwright global setup
```

## 🌊 Cypress Tests

### Core Navigation Tests (`app-navigation.cy.ts`)
Tests the essential user journeys:

- ✅ **Load app with seed data**: Verifies app loads with test subscriptions
- ✅ **Subscriptions tab navigation**: Click tab → assert card list visible
- ✅ **Dashboard tab navigation**: Click tab → assert graph elements visible
- ✅ **Tab switching performance**: Ensures fast switching (< 100ms)
- ✅ **Add subscription functionality**: Tests form accessibility and validation
- ✅ **Dark mode toggle**: Verifies theme switching works instantly
- ✅ **Error boundaries**: Tests app resilience with corrupted data

### Running Cypress Tests
```bash
# Run all Cypress tests
npm run test:e2e

# Run specific test file
npx cypress run --spec "tests/e2e/app-navigation.cy.ts"

# Open Cypress GUI for debugging
npm run test:e2e:open
```

### Cypress Test Data
Tests automatically seed the following data:
- Netflix Premium ($15.99/month)
- Adobe Creative Cloud ($52.99/month) 
- Figma Professional ($12.00/month)
- Business Visa payment card
- Light theme preference

## 🎭 Playwright Tests

### Comprehensive Tests (`app-comprehensive.spec.ts`)
Advanced testing scenarios:

- ✅ **Desktop functionality**: Full app behavior verification
- ✅ **Mobile viewport testing**: FAB menu and responsive design
- ✅ **Performance testing**: Tab switching speed validation
- ✅ **Data editing**: CRUD operations for subscriptions and cards
- ✅ **Sync functionality**: Manual and automatic sync testing
- ✅ **Theme switching**: Dark/light mode toggle verification
- ✅ **Error resilience**: App behavior with invalid data

### Running Playwright Tests
```bash
# Run all Playwright tests
npm run test:visual

# Run specific project
npx playwright test --project=e2e-chromium

# Run mobile tests only
npx playwright test --project=e2e-mobile

# Debug with headed browser
npm run test:visual:headed
```

### Playwright Projects
- `e2e-chromium`: Desktop Chrome tests (1280×720)
- `e2e-mobile`: Mobile tests (393×851 Pixel 5)
- `visual-*`: Visual regression testing projects

## 📱 Mobile Testing

### Automated Mobile Tests
Playwright automatically tests:
- Mobile viewport rendering (375×667 to 393×851)
- FAB menu functionality and performance
- Tab switching speed on mobile
- Touch interactions and responsive design
- Mobile menu behavior

### Manual Mobile QA
Use `tests/manual-qa/mobile-checklist.md` for comprehensive mobile testing:

1. **FAB Menu Testing**
   - Opens instantly on tap
   - Closes on outside tap, ESC, or FAB tap
   - No visual artifacts remain

2. **Tab Performance**
   - Tab switches render within 100ms
   - No loading spinners during tab changes
   - Smooth transitions and no layout shifts

3. **Responsive Design**
   - Touch targets ≥ 44px
   - No horizontal scrolling
   - Content readable without zooming

## 🔄 Regression Testing

### Automated Regression Coverage
- ✅ Data editing (add, edit, delete subscriptions/cards)
- ✅ Add subscription form validation and submission
- ✅ Sync functionality and status indicators
- ✅ Dark mode toggle and persistence
- ✅ Navigation and routing
- ✅ Performance benchmarks

### Manual Regression Testing
Use `tests/regression/regression-checklist.md` for comprehensive coverage:

#### Critical Test Areas
1. **Data Operations**
   - Subscription CRUD operations
   - Payment card management
   - Bulk operations
   - Data persistence

2. **User Interface**
   - Navigation consistency
   - Theme switching
   - Form validation
   - Mobile responsiveness

3. **Performance**
   - Loading times (< 3 seconds)
   - Tab switching (< 100ms)
   - Chart rendering (< 200ms)
   - Memory usage

4. **Integration**
   - API endpoints
   - Authentication
   - Sync mechanisms
   - Error handling

## 📊 Test Reports

### Automated Reports
Test execution generates comprehensive reports:

```
test-results/
├── reports/
│   ├── e2e-test-report.html    # Interactive HTML report
│   └── e2e-test-report.json    # Machine-readable results
├── screenshots/                # Test failure screenshots
├── videos/                     # Test execution recordings
├── cypress/                    # Cypress test results
└── playwright/                 # Playwright test artifacts
```

### Report Features
- ✅ Test execution summary with pass/fail counts
- ✅ Performance metrics (tab switching, loading times)
- ✅ Screenshots and videos for failed tests
- ✅ Manual testing checklist integration
- ✅ Recommendations for next steps

## 🛠️ Test Configuration

### Environment Variables
```bash
# Cypress configuration (cypress.config.ts)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
ENABLE_MOCK_DATA=true

# Playwright configuration (playwright.config.ts)
CI=false                        # Local development mode
```

### Customization Options
```bash
# Skip specific test suites
node run-e2e-tests.js --skip-cypress
node run-e2e-tests.js --skip-playwright
node run-e2e-tests.js --skip-mobile

# Include visual regression tests (slower)
node run-e2e-tests.js --include-visual
```

## 🎯 Performance Benchmarks

### Target Performance Metrics
- **App load time**: < 3 seconds
- **Tab switching**: < 100ms
- **FAB menu open/close**: < 50ms
- **Chart rendering**: < 200ms
- **Theme toggle**: Instant (< 100ms)

### Performance Testing
Tests automatically measure and validate:
- Tab navigation speed
- UI interaction responsiveness
- Chart/graph rendering performance
- Memory usage patterns
- Network request timing

## 🚨 Troubleshooting

### Common Issues

**Development server not running**
```bash
npm run dev
# Ensure server is available at http://localhost:5175
```

**Cypress tests fail to find elements**
- Check that seed data loads properly
- Verify element selectors match current UI
- Use `cy.debug()` or Cypress GUI for debugging

**Playwright timeouts**
- Increase timeout in `playwright.config.ts`
- Check network conditions
- Verify app responsiveness

**Mobile tests fail**
- Ensure mobile viewports are properly set
- Check touch target sizes (minimum 44px)
- Verify responsive design implementation

### Debug Commands
```bash
# Debug Cypress interactively
npx cypress open

# Debug Playwright with headed browser
npx playwright test --headed --debug

# Generate verbose test reports
npx playwright test --reporter=verbose

# Test specific functionality
npx cypress run --spec "tests/e2e/app-navigation.cy.ts" --headed
```

## 📋 Manual Testing Checklist

After automated tests complete, perform manual testing:

### 1. Mobile Viewport Testing
- [ ] Use `tests/manual-qa/mobile-checklist.md`
- [ ] Test on real devices (iOS/Android)
- [ ] Verify FAB menu instant response
- [ ] Check tab switching performance

### 2. Cross-browser Testing
- [ ] Chrome, Firefox, Safari, Edge
- [ ] Mobile browsers
- [ ] Consistent behavior verification

### 3. Regression Testing
- [ ] Use `tests/regression/regression-checklist.md`
- [ ] Data editing operations
- [ ] Sync functionality
- [ ] Theme switching
- [ ] Performance validation

## 🎉 Success Criteria

### Automated Test Pass Requirements
- ✅ All Cypress navigation tests pass
- ✅ All Playwright functionality tests pass
- ✅ Mobile viewport tests pass
- ✅ Performance benchmarks met
- ✅ No critical errors in console

### Manual QA Sign-off Requirements
- ✅ FAB menu opens/closes instantly on mobile
- ✅ Tab changes render within 100ms
- ✅ All touch targets meet accessibility standards
- ✅ Dark mode toggle works across all screens
- ✅ No regression in core functionality

---

## 📞 Support

For issues with the testing suite:
1. Check this documentation first
2. Review test logs and reports in `test-results/`
3. Use debug commands to isolate issues
4. Ensure development environment matches test requirements

The comprehensive E2E testing suite ensures SubTracker meets all quality, performance, and user experience standards before deployment.
