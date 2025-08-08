# [ST-009] - Clean Up Remaining TypeScript Warnings & Errors

## Details
**Priority**: 🟡 Medium  
**Estimate**: M (3-8 hours)  
**Tags**: `refactor` `cleanup` `build` `quality`  
**Assignee**: Solo Dev (Claude + Warp)  
**Created**: 2025-08-07  
**Status**: 📋 Todo  

## Description
Following the major progress in ST-001 (reduced errors from 285 to 195), we need to clean up the remaining 195 TypeScript errors and warnings. These are primarily non-critical issues that don't prevent the application from running but should be resolved for code quality and maintainability.

## Acceptance Criteria
- [ ] Reduce remaining 195 TypeScript errors to under 50
- [ ] Remove all unused imports and variables
- [ ] Fix test setup and configuration issues
- [ ] Resolve UI component type issues
- [ ] Convert remaining regular imports to type-only imports where needed
- [ ] Clean build with minimal warnings

## Technical Notes
### Remaining Error Categories (195 total):

#### 1. Unused Imports/Variables (~60% of errors)
- Components importing but not using: `TabsContent`, `PieChart`, `Pie`, `Cell`, etc.
- Unused variables in function parameters: `cards`, `index`, `type`, etc.
- Variables declared but never read: `isTablet`, `watchlistItems`, `recentActivity`

#### 2. Test Setup Issues (~20% of errors)  
- Missing Jest DOM matchers: `toBeInTheDocument`, `toBeDisabled`, etc.
- Test utility type imports need to be type-only
- Mock data interface mismatches

#### 3. UI Component Type Issues (~15% of errors)
- Calendar component icon customization
- Chart component payload types
- Dialog component prop access

#### 4. Import Type Issues (~5% of errors)
- Need type-only imports for: `FullSubscription`, `ProfilerOnRenderCallback`, etc.
- Some imports from `@supabase/supabase-js` unused

### High-Impact Quick Wins:
1. **Remove unused imports** - Will fix ~120 errors quickly
2. **Fix test setup** - Configure Jest DOM matchers properly  
3. **Convert type imports** - Fix remaining verbatimModuleSyntax violations
4. **Clean up component props** - Remove unused destructured parameters

### Files Most Affected:
- `src/components/DashboardTab.tsx` - 10 unused import errors
- `src/components/SubscriptionsUnifiedTab.tsx` - 8 unused import errors  
- `src/components/HeaderComponents.tsx` - 7 unused import errors
- `src/test/**/*.tsx` - Multiple test setup issues
- `src/components/ui/*.tsx` - Component type issues

## Implementation Strategy
**Phase 1: Quick Wins (2-3 hours)**
1. Systematic removal of unused imports across all components
2. Remove unused variables and parameters  
3. Fix obvious type-only import violations

**Phase 2: Test & UI Fixes (2-3 hours)**  
1. Configure Jest DOM matchers properly
2. Fix UI component type definitions
3. Address remaining edge cases

**Phase 3: Final Cleanup (1-2 hours)**
1. Verify build is clean
2. Test that application still functions correctly
3. Update documentation

## Definition of Done
- [ ] TypeScript errors reduced to under 50 (target: under 25)
- [ ] `npm run build` completes with minimal warnings
- [ ] `npm run type-check` passes cleanly
- [ ] All linting passes (`npm run lint`)
- [ ] No functionality regressions
- [ ] Tests still pass where configured

## Priority Rationale
- **Medium Priority**: Core functionality works after ST-001 fixes
- **Quality Investment**: Cleaner codebase for future development
- **Developer Experience**: Fewer distracting warnings during development
- **Deployment Ready**: Prepares for production deployment confidence

## Related Issues
- **[ST-001]**: Major TypeScript fixes (predecessor)
- **[ST-002]**: Production deployment (benefits from clean build)
- **[ST-003]**: Testing setup (shares test configuration fixes)

## Estimated Breakdown
- **Remove unused imports/variables**: 3-4 hours
- **Fix test configuration**: 1-2 hours  
- **UI component types**: 1-2 hours
- **Final verification**: 1 hour
- **Total**: 6-9 hours (Medium estimate)

---
*Created: 2025-08-07 23:16*
