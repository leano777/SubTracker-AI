# Mobile Viewport Manual QA Checklist

## Overview
This checklist ensures the SubTracker app works properly on mobile devices with special focus on FAB (Floating Action Button) menu behavior and instant tab rendering.

## Pre-Testing Setup
- [ ] Open app in Chrome DevTools mobile emulation
- [ ] Test on multiple mobile viewports:
  - [ ] iPhone SE (375×667)
  - [ ] iPhone 12/13 (390×844)
  - [ ] Pixel 5 (393×851)
  - [ ] Samsung Galaxy S20 (360×800)
- [ ] Test in both portrait and landscape orientations
- [ ] Test with both touch and mouse interaction

## 📱 Mobile Navigation & Layout

### Header & Navigation
- [ ] **Header remains visible**: App header/nav bar stays accessible at all times
- [ ] **Logo/title readable**: App branding is clearly visible and not cut off
- [ ] **Navigation accessible**: Primary navigation is easily accessible
- [ ] **Search functionality**: Global search (if present) works on mobile
- [ ] **User menu accessible**: Profile/settings menu accessible on mobile

### Tab Navigation
- [ ] **Tab buttons visible**: All primary tabs (Dashboard, Subscriptions, etc.) are visible
- [ ] **Tab buttons touchable**: Tabs have adequate touch targets (minimum 44px)
- [ ] **Active tab clearly marked**: Current active tab is visually distinct
- [ ] **Tab overflow handled**: If too many tabs, overflow is handled gracefully
- [ ] **Swipe gestures** (if implemented): Horizontal swiping between tabs works

## 🎯 FAB Menu Testing

### FAB Visibility & Behavior
- [ ] **FAB menu present**: Floating Action Button is visible on mobile
- [ ] **FAB positioning**: FAB is positioned correctly (typically bottom-right)
- [ ] **FAB does not obstruct content**: FAB doesn't cover important UI elements
- [ ] **FAB z-index correct**: FAB appears above other content appropriately

### FAB Menu Opening
- [ ] **Single tap opens menu**: FAB opens with single tap/touch
- [ ] **Menu animation smooth**: Opening animation is smooth (no jank)
- [ ] **Menu items visible**: All menu options are clearly visible when open
- [ ] **Menu items accessible**: Each menu item has adequate touch targets

### FAB Menu Closing
- [ ] **Tap outside closes menu**: Tapping outside the menu closes it
- [ ] **Tap FAB again closes menu**: Tapping the FAB again closes the menu
- [ ] **Escape key closes menu**: ESC key closes menu (for keyboard users)
- [ ] **Back gesture closes menu**: Device back gesture closes menu (Android)
- [ ] **Menu closes instantly**: No delay in menu closing
- [ ] **No menu artifacts**: No visual artifacts remain after closing

## ⚡ Tab Change Performance

### Instant Rendering Requirements
- [ ] **Tab switch < 100ms**: Tab changes render within 100ms
- [ ] **No loading spinners**: Tab switches don't show loading states
- [ ] **Content immediately visible**: Tab content appears instantly
- [ ] **No layout shift**: No content jumping/shifting during tab change
- [ ] **Smooth transitions**: Tab change animations are smooth

### Tab Content Rendering
- [ ] **Images load quickly**: Subscription logos/images render fast
- [ ] **Data populated instantly**: Subscription data shows immediately
- [ ] **Charts render quickly**: Dashboard charts render within 200ms
- [ ] **Lists scroll smoothly**: Subscription lists scroll without lag
- [ ] **Interactive elements responsive**: Buttons/links respond immediately

## 📋 Content Display Mobile

### Subscription Cards/Lists
- [ ] **Cards fit mobile screen**: Subscription cards fit mobile viewport properly
- [ ] **Card content readable**: All text in subscription cards is readable
- [ ] **Card actions accessible**: Edit/delete buttons are easily tappable
- [ ] **Card spacing appropriate**: Cards have adequate spacing between them
- [ ] **Card images display**: Subscription logos/favicons display correctly

### Dashboard on Mobile
- [ ] **Charts mobile-optimized**: Charts/graphs display well on small screens
- [ ] **Stats cards fit screen**: Statistic cards fit mobile viewport
- [ ] **Text remains readable**: All dashboard text is legible on mobile
- [ ] **Horizontal scrolling avoided**: No unwanted horizontal scrolling
- [ ] **Graphs interactive**: Charts respond to touch interactions

## 🔧 Forms & Modals Mobile

### Add/Edit Forms
- [ ] **Forms fill screen appropriately**: Forms use mobile screen effectively
- [ ] **Input fields accessible**: All form inputs are easily tappable
- [ ] **Keyboard doesn't break layout**: Virtual keyboard doesn't break UI
- [ ] **Form validation visible**: Error messages clearly visible
- [ ] **Save/cancel buttons reachable**: Action buttons easily accessible

### Modal Dialogs
- [ ] **Modals mobile-responsive**: Modals adjust to mobile screen size
- [ ] **Modal close buttons accessible**: Close/cancel buttons easy to reach
- [ ] **Modal content scrollable**: Long modal content scrolls properly
- [ ] **Modal overlay covers screen**: Modal overlay covers full viewport
- [ ] **No modal overflow**: Modal content doesn't overflow screen

## ⚙️ Mobile-Specific Features

### Touch Interactions
- [ ] **Touch targets adequate**: All interactive elements ≥ 44px
- [ ] **No accidental activations**: Touch targets not too close together
- [ ] **Touch feedback present**: Visual feedback on touch interactions
- [ ] **Long press handled**: Long press interactions work if implemented
- [ ] **Pinch zoom disabled**: Unwanted zooming is prevented

### Responsive Behavior
- [ ] **Orientation changes handled**: App works in both portrait/landscape
- [ ] **Font sizes appropriate**: Text is readable without zooming
- [ ] **Buttons thumb-friendly**: Buttons sized for thumb navigation
- [ ] **Content priority correct**: Most important content visible first
- [ ] **Progressive disclosure**: Less important features appropriately hidden

## 🎨 Theme & Appearance Mobile

### Dark Mode on Mobile
- [ ] **Dark mode toggle accessible**: Theme toggle easily found on mobile
- [ ] **Dark mode renders instantly**: Theme changes without delay
- [ ] **Dark mode readable**: All text readable in dark mode on mobile
- [ ] **Dark mode graphics appropriate**: Charts/graphs work in dark mode

## 🔍 Testing Scenarios

### Multi-tasking Scenarios
- [ ] **App switching**: App state preserved when switching apps
- [ ] **Background/foreground**: App resumes properly from background
- [ ] **Memory pressure**: App handles low memory conditions
- [ ] **Network changes**: App handles network connectivity changes

### Edge Cases
- [ ] **Very long subscription names**: Long names don't break layout
- [ ] **Many subscriptions**: Performance with 50+ subscriptions
- [ ] **Empty states**: Empty states display properly on mobile
- [ ] **Error states**: Error messages readable on mobile

## 📝 Test Results Documentation

### Record for each test:
- [ ] **Device/viewport tested**: Record screen size and device
- [ ] **Issues found**: Document any problems discovered
- [ ] **Performance metrics**: Note any slow renders/interactions
- [ ] **Screenshots**: Capture examples of issues or successes

### Performance Benchmarks:
- Tab switch time: _____ ms (target: < 100ms)
- FAB menu open time: _____ ms (target: < 50ms)
- FAB menu close time: _____ ms (target: < 50ms)
- Chart render time: _____ ms (target: < 200ms)

## ✅ Sign-off Criteria

### All items must pass:
- [ ] FAB menu opens and closes instantly
- [ ] Tab changes render within 100ms
- [ ] All touch targets meet 44px minimum
- [ ] No horizontal scrolling on any screen
- [ ] All content readable without zooming
- [ ] No layout breaks in portrait/landscape
- [ ] Dark mode works properly on mobile
- [ ] Forms usable with virtual keyboard

### Notes:
```
Date Tested: ________________
Tester: ____________________
Devices Tested: ____________
Issues Found: ______________
____________________________
____________________________
```

## 🚨 Critical Issues (Stop Ship)
Mark any critical issues that should block release:
- [ ] FAB menu doesn't close
- [ ] Tab switching broken
- [ ] App unusable on mobile
- [ ] Critical content not accessible
- [ ] App crashes on mobile device
