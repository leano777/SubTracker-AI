# ADR-001: State Management Approach

## Status
Accepted

## Context
The SubTracker AI application requires complex state management for subscriptions, user data, authentication, UI state, and real-time synchronization with Supabase. We need to decide on a state management approach that can handle:

1. Local state management for UI components
2. Global state for subscriptions and user data
3. Authentication state management
4. Real-time synchronization with backend
5. Offline/online state handling
6. Performance optimization with minimal re-renders

The application started with excessive local state causing performance issues and re-render cascades.

## Decision
We will use a hybrid state management approach:

### 1. Zustand for Global State
- **Subscriptions data**: Store all subscription records globally
- **User preferences**: Settings, theme, currency, etc.
- **Application state**: Active tab, filters, search state
- **Cache management**: API responses and computed values

### 2. React Context for Cross-Cutting Concerns
- **Authentication**: User session, auth status, auth methods
- **Theme**: Theme provider for consistent styling
- **Real-time sync**: Connection status and sync operations

### 3. Local Component State
- **Form state**: Use React Hook Form for forms
- **UI interactions**: Modal open/close, temporary UI states
- **Component-specific state**: Loading states, local toggles

### 4. Custom Hooks for Business Logic
- **useDataManagement**: Central hook for CRUD operations
- **useAuth**: Authentication logic and user management
- **useSync**: Real-time synchronization logic
- **useSubscriptions**: Subscription-specific operations

## Consequences

### Positive
- **Clear separation of concerns**: Each state type has its designated place
- **Performance optimized**: Zustand prevents unnecessary re-renders
- **Scalable**: Easy to add new global state slices
- **Developer experience**: Predictable patterns for state management
- **Type safety**: Full TypeScript support across all state layers
- **Testing friendly**: Each state layer can be tested independently

### Negative
- **Learning curve**: Developers need to understand multiple state paradigms
- **Initial complexity**: More setup required compared to useState everywhere
- **Potential over-engineering**: Simple UI state might be over-abstracted

### Neutral
- **Bundle size**: Zustand is lightweight, minimal impact
- **Migration effort**: Required refactoring existing useState implementations
- **Maintenance**: Requires discipline to follow the established patterns

## Alternatives Considered

### Redux Toolkit
- **Pros**: Industry standard, excellent DevTools, predictable patterns
- **Cons**: More boilerplate, overkill for this application size, steeper learning curve

### React Context Only
- **Pros**: Built-in React solution, no additional dependencies
- **Cons**: Performance issues with frequent updates, provider hell with multiple contexts

### Jotai/Recoil
- **Pros**: Atomic state management, fine-grained updates
- **Cons**: Less mature ecosystem, complex mental model for team

### Valtio
- **Pros**: Mutable syntax, proxy-based reactivity
- **Cons**: Less TypeScript-friendly, different paradigm from React patterns

## Implementation Notes

### Zustand Store Structure
```typescript
interface AppStore {
  // Subscriptions
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
  
  // UI State
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  
  // User Preferences
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
}
```

### Authentication Context
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
```

### Custom Hook Pattern
```typescript
const useDataManagement = (userId: string | null) => {
  // Combine Zustand store with Supabase operations
  // Handle optimistic updates and error states
  // Provide unified interface for components
};
```

### State Flow Architecture
1. **Components** interact with **Custom Hooks**
2. **Custom Hooks** coordinate between **Zustand Store** and **API calls**
3. **Context Providers** handle cross-cutting concerns
4. **Real-time updates** flow through **Supabase subscriptions** to **Zustand store**

### Performance Considerations
- Use Zustand selectors to prevent unnecessary re-renders
- Implement proper memoization in custom hooks
- Use React.memo for expensive components
- Batch related state updates

### Testing Strategy
- Unit tests for Zustand store actions and selectors
- Integration tests for custom hooks with mock Supabase
- Context provider tests with React Testing Library
- E2E tests for complete state flow scenarios

## References
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Context Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [State Management Performance Analysis](../performance/state-management-analysis.md)
- [Original Performance Issues](../../DEBUGGING_PLAN.md#state-management-race-conditions)
