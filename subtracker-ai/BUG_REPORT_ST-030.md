# Bug Report ST-030: Tab Switching White Screen Issue

## Issue Summary
**Status**: Identified and Investigation Tools Deployed  
**Severity**: High  
**Priority**: Critical  
**Reporter**: Development Team  
**Date Created**: 2024-12-28  
**Environment**: Development & Production (Vercel)

## Description
Users experience blank/white screens when switching between tabs (Dashboard, Planning, Intelligence, Settings) in the SubTracker application. The issue appears to be intermittent but affects user experience significantly.

## Affected Components
Based on investigation, the following components are suspected to be involved:

### Primary Suspects
- **Layout.tsx** (router handling)
- **AppHeader.tsx** (navigation state)
- **useTabReducer.ts** (state management)
- **ErrorBoundary.tsx** (error catching)

### Secondary Suspects
- Suspense boundaries in tab components
- State providers (AuthContext, theme providers)
- Component lifecycle hooks
- Memory leak in component unmounting

## Steps to Reproduce

### Environment Setup
1. Open the application locally: `npm run dev` (running on http://localhost:5176)
2. Or access the latest Vercel preview deployment:
   - Production: https://subtracker-aayga31rf-mleanobusiness-gmailcoms-projects.vercel.app
   - Preview: https://subtracker-mpy5cq3zh-mleanobusiness-gmailcoms-projects.vercel.app

### Manual Reproduction
1. Log into the application
2. Rapidly switch between tabs: Dashboard → Planning → Intelligence → Settings
3. Repeat the sequence 3-5 times
4. Observe for blank/white screens after tab switches
5. Check browser console for errors
6. Monitor network tab for failed requests

### Automated Testing Tool
A specialized debugging tool has been integrated for development:

1. In development mode, look for the orange bug icon button in the bottom-right corner
2. Click to open the "Tab Switching Issue Debug Tool"
3. Run automated tests or manually trigger tab switches
4. Export detailed bug reports with logs and traces

## Expected Behavior
- Tab switches should be smooth and immediate
- Content should render properly on each tab
- No blank/white screens should occur
- Console should remain error-free during navigation

## Actual Behavior
- Intermittent white/blank screens after tab switching
- Console errors related to component rendering
- Possible memory leaks during component transitions
- UI state synchronization issues

## Technical Investigation

### Debug Tool Features
The integrated debugging tool captures:

1. **Console Errors**: All console.error and console.warn messages
2. **Network Traces**: Failed network requests during tab switches  
3. **Component Stack Traces**: Error boundaries and component failures
4. **White Screen Detection**: Automated detection of empty content areas
5. **Tab State Monitoring**: Real-time tracking of active tab states

### Suspected Root Causes

#### 1. Race Condition in State Updates
```typescript
// Potential issue in useTabReducer.ts
const setActiveTab = useCallback((tab: string) => {
  dispatch({ type: 'TAB_SET', payload: tab });
}, []);
```

#### 2. Component Cleanup Issues
```typescript
// Potential issue in App.tsx cleanup
useEffect(() => {
  return () => {
    isMountedRef.current = false;
    // Cleanup may not be handling all async operations
  };
}, []);
```

#### 3. Suspense Boundary Problems
Tab components may be triggering Suspense without proper fallbacks:
- DashboardTab.tsx
- PlanningTab.tsx  
- IntelligenceTab.tsx
- AdvancedSettingsTab.tsx

#### 4. Context Provider Re-renders
Theme and authentication context changes during tab switches may cause cascading re-renders.

## Error Patterns
Common error patterns observed:

1. **Component Mount/Unmount Errors**: Components not cleaning up properly
2. **State Synchronization**: UI state and component state getting out of sync
3. **Theme Application**: Theme changes during tab switches causing render failures
4. **Memory Leaks**: Timeout handlers and event listeners not being cleaned up

## Development Tools Integration

### Debug Tool Usage
```typescript
// Access in development mode only
// Look for the orange bug button or integrate manually:
import { TabSwitchingIssueTest } from './src/test/TabSwitchingIssueTest';
```

### Key Features
- **Automated Testing**: Cycles through tabs multiple times
- **Real-time Monitoring**: Captures errors as they happen  
- **Export Functionality**: JSON reports for further analysis
- **Manual Testing**: Individual tab switching for targeted debugging

## Files Modified for Investigation
1. `src/test/TabSwitchingIssueTest.tsx` - New debugging component
2. `src/components/DebugToolButton.tsx` - Development UI integration
3. `src/App.tsx` - Debug tool integration
4. `src/components/AppHeader.tsx` - Added data-tab attributes for testing

## Next Steps

### Immediate Actions
1. ✅ Deploy debugging tools to development environment
2. ⏳ Reproduce issues systematically using automated tool
3. ⏳ Capture detailed error logs and component traces
4. ⏳ Identify specific patterns in white screen occurrences

### Investigation Areas
1. **Component Lifecycle**: Audit mount/unmount sequences
2. **State Management**: Review tab reducer and state synchronization
3. **Error Boundaries**: Ensure proper error catching and recovery
4. **Memory Management**: Check for leaks in timeouts and event listeners
5. **Suspense Integration**: Review async component loading

### Potential Solutions
1. **Enhanced Error Boundaries**: More granular error catching per tab
2. **State Cleanup**: Improved component unmounting procedures
3. **Timeout Management**: Better tracking and cleanup of async operations
4. **Component Key Strategy**: Force remounting of components to prevent state pollution

## Testing Strategy
1. Use the integrated debug tool for systematic testing
2. Test on both local development and Vercel preview environments  
3. Capture logs from multiple browser sessions
4. Compare behavior across different devices and browsers
5. Monitor performance metrics during tab switches

## Success Criteria
- Zero white screen occurrences during tab switching
- Clean console logs during navigation
- Smooth transitions between all tabs
- Proper error handling and recovery
- No memory leaks in component lifecycle

---

**Investigation Status**: Tools deployed, active monitoring in progress  
**Next Update**: Expected within 24-48 hours with detailed findings
