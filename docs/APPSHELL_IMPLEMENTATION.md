# AppShell Implementation Documentation

## ST-034: Adaptive Layout & Navigation

### Overview

This document outlines the implementation of a responsive AppShell component that provides:
- **Responsive Layout**: Sidebar on desktop ↔ Bottom navigation on mobile
- **Sticky Header**: Page title and global actions
- **Route Transitions**: Animated transitions with React Router + Framer Motion

### Architecture

#### Component Structure

```
AppShell (Main Shell)
├── SidebarProvider (Desktop Layout Context)
├── AppSidebar (Desktop Navigation)
├── SidebarInset (Main Content Area)
│   ├── AppHeader (Sticky Header)
│   └── main (Page Content with Route Transitions)
└── MobileBottomNav (Mobile Navigation)
```

### Key Features

#### 1. Responsive Navigation System

**Desktop (≥768px)**
- Collapsible sidebar with Shadcn/UI sidebar components
- Logo, navigation items, and footer
- Keyboard shortcut support (Cmd/Ctrl + B)
- Hover states and active indicators

**Mobile (<768px)**  
- Fixed bottom navigation bar
- Icon + abbreviated text labels
- Haptic feedback with `whileTap` animations
- Safe area support for devices with notches

#### 2. Sticky Header Component

**Features:**
- Dynamic page title based on current route
- Global search bar (hidden on mobile screens < sm)
- Sync status indicator with real-time updates
- Notification bell with badge count
- User profile dropdown menu
- Responsive layout with proper spacing

**Animations:**
- Slide-in animation on mount
- Staggered entrance animations for child elements
- Smooth transitions between states

#### 3. Route Transitions

**Implementation:**
- Uses `AnimatePresence` with `mode="wait"`
- Three transition variants available:
  - `route-fade`: Opacity + slight vertical movement
  - `route-slide`: Horizontal slide effect  
  - `route-scale`: Scale + opacity transition

**Performance:**
- Optimized transition timing (200ms)
- GPU-accelerated transforms
- Reduced motion support

### File Structure

```
src/
├── components/
│   ├── AppShell.tsx           # Main shell component
│   └── ui/
│       ├── motion.ts          # Animation variants
│       ├── sidebar.tsx        # Desktop sidebar components
│       └── use-mobile.ts      # Mobile detection hook
├── router.tsx                 # Router configuration
├── RouterApp.tsx             # App wrapper with router
└── styles/globals.css        # Enhanced CSS utilities
```

### Router Integration

#### Route Configuration

```typescript
const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard", 
    icon: LayoutDashboard,
    path: "/dashboard"
  },
  // ... other routes
];
```

#### Route Components
- `DashboardRoute`: Dashboard tab wrapper
- `SubscriptionsRoute`: Subscriptions tab wrapper  
- `PlanningRoute`: Planning tab wrapper
- `IntelligenceRoute`: Intelligence tab wrapper

### Theming Support

#### Theme Variants
- **Light Mode**: Default glassmorphism styling
- **Dark Mode**: Enhanced contrast with darker glass effects  
- **Stealth Ops**: Tactical monospace theme with green accents

#### Responsive Adjustments
- Mobile glassmorphism uses reduced blur for better performance
- Typography scales with viewport size using clamp()
- Touch targets meet minimum 44px requirement

### Accessibility Features

#### Focus Management
- Proper focus ring indicators
- Keyboard navigation support
- ARIA labels and descriptions
- Screen reader friendly structure

#### Mobile Accessibility  
- Safe area inset support
- Touch target optimization
- Reduced motion support
- High contrast mode compatibility

### Performance Optimizations

#### Bundle Splitting
- Route-based code splitting
- Dynamic imports for heavy components
- Tree-shaking for unused motion variants

#### Animation Performance
- GPU-accelerated transforms
- Optimized transition timings
- `will-change` properties for smooth animations
- Reduced motion preference support

#### Mobile Optimizations
- Reduced backdrop blur on mobile devices
- Optimized touch event handling
- Battery-conscious animation approach

### CSS Utilities

#### Safe Area Support
```css
.safe-area-pb { padding-bottom: env(safe-area-inset-bottom); }
.safe-area-pt { padding-top: env(safe-area-inset-top); }
.bottom-nav-height { height: calc(4rem + env(safe-area-inset-bottom)); }
```

#### Motion Utilities
```css
.route-transition { @apply transition-all duration-200 ease-out; }
```

### Browser Support

#### Modern Features Used
- CSS `env()` for safe area insets
- CSS Grid for bottom navigation layout
- CSS Custom Properties for theming
- `backdrop-filter` for glassmorphism

#### Fallbacks
- Graceful degradation for older browsers
- Progressive enhancement approach
- Feature detection for advanced capabilities

### Testing Considerations

#### Responsive Testing
- Test breakpoint transitions (768px)
- Verify touch target sizes on mobile
- Test safe area handling on various devices

#### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation flow
- Focus management verification
- Color contrast compliance

#### Performance Testing
- Animation frame rate monitoring
- Memory usage during route transitions
- Mobile device performance validation

### Future Enhancements

#### Planned Features
- Gesture-based navigation (swipe to navigate)
- Persistent layout state
- Advanced keyboard shortcuts
- Context-aware navigation

#### Performance Improvements
- Virtual scrolling for large navigation lists
- Intersection Observer for viewport optimizations
- Service Worker integration for offline functionality

### Migration Guide

#### From Tab-based Navigation

1. **Replace AppHeader imports:**
   ```typescript
   // Old
   import { AppHeader } from './components/AppHeader';
   
   // New  
   import AppShell from './components/AppShell';
   ```

2. **Update main App component:**
   ```typescript
   // Old
   <AppHeader activeTab={tab} setActiveTab={setTab} />
   
   // New
   <RouterProvider router={router} />
   ```

3. **Convert tab logic to routes:**
   ```typescript
   // Old
   const [activeTab, setActiveTab] = useState('dashboard');
   
   // New
   const navigate = useNavigate();
   const location = useLocation();
   ```

### Troubleshooting

#### Common Issues

**Router not working:**
- Verify React Router DOM is installed
- Check router configuration in `router.tsx`
- Ensure `BrowserRouter` is properly configured

**Mobile navigation not showing:**
- Check `useIsMobile` hook implementation
- Verify CSS media queries
- Test on actual device vs. browser dev tools

**Animations not smooth:**
- Check for conflicting CSS transitions
- Verify Framer Motion is properly installed
- Test with reduced motion settings

**Safe area not working:**
- Ensure viewport meta tag includes `viewport-fit=cover`
- Test on actual device with notch/island
- Verify CSS `env()` support

### Performance Metrics

#### Target Metrics
- Initial load: < 3s on 3G
- Route transition: < 200ms
- Touch response: < 16ms
- Memory usage: < 50MB on mobile

#### Monitoring
- Web Vitals integration
- Route transition timing
- Animation frame rate tracking
- Memory leak detection

---

## Implementation Status: ✅ Complete

### Deliverables
- [x] Responsive AppShell component
- [x] Desktop sidebar navigation  
- [x] Mobile bottom navigation
- [x] Sticky header with page context
- [x] Animated route transitions
- [x] Theme support (Light/Dark/Stealth)
- [x] Accessibility features
- [x] Performance optimizations
- [x] Mobile safe area support
- [x] Comprehensive documentation

### Testing Status
- [x] Component renders correctly
- [x] Route navigation works
- [x] Mobile responsiveness verified
- [x] Animations perform smoothly
- [x] Accessibility features functional
- [x] Safe area support working

**Ready for Production Deployment** 🚀
