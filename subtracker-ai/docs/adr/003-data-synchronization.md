# ADR-003: Data Synchronization Strategy

## Status
Accepted

## Context
The SubTracker AI application needs to synchronize subscription data across multiple devices and sessions while providing a smooth user experience. Key requirements include:

1. **Real-time synchronization** - Changes should appear across devices immediately
2. **Offline support** - App should work when internet is unavailable
3. **Conflict resolution** - Handle simultaneous edits gracefully
4. **Performance** - Minimize unnecessary network requests and re-renders
5. **Data consistency** - Ensure data integrity across all clients
6. **User experience** - Provide immediate feedback for user actions

The application initially had inconsistent sync behavior leading to data loss and poor user experience.

## Decision
We will implement a **hybrid synchronization strategy** using Supabase real-time subscriptions with local-first architecture:

### 1. Local-First Architecture
- **Primary data source**: Local state (Zustand store)
- **Immediate updates**: All user actions update local state immediately
- **Background sync**: Changes propagate to server in background
- **Optimistic updates**: UI updates immediately, with rollback on failure

### 2. Real-time Bidirectional Sync
- **Supabase Real-time**: WebSocket connection for live updates
- **Subscription channels**: Subscribe to changes on user's data
- **Automatic conflict resolution**: Last-write-wins with client timestamps
- **Connection management**: Automatic reconnection and backoff strategies

### 3. Offline-First Approach
- **Persistent local storage**: IndexedDB via Zustand persist middleware
- **Queue pending operations**: Store offline changes for later sync
- **Smart sync on reconnection**: Batch and prioritize pending changes
- **User feedback**: Clear indication of online/offline status

## Consequences

### Positive
- **Excellent UX**: Immediate response to user actions
- **Real-time collaboration**: Multiple devices stay in sync
- **Offline capability**: App remains functional without internet
- **Data durability**: Changes are never lost due to local persistence
- **Scalable**: Supabase handles the complexity of real-time infrastructure
- **Conflict resolution**: Predictable behavior for simultaneous edits

### Negative
- **Complexity**: More complex than simple request/response pattern
- **Memory usage**: Maintaining local cache increases memory footprint
- **Potential inconsistency**: Brief moments where clients might be out of sync
- **Debug difficulty**: More complex data flow to debug

### Neutral
- **Learning curve**: Team needs to understand local-first patterns
- **Testing complexity**: Need to test online/offline scenarios
- **Bundle size**: Additional code for sync logic

## Alternatives Considered

### Traditional REST API Only
- **Pros**: Simple, well-understood, stateless
- **Cons**: Poor UX (loading states), no real-time updates, no offline support

### Server-Sent Events (SSE)
- **Pros**: Simpler than WebSockets, good browser support
- **Cons**: One-way communication, less efficient than WebSockets

### Manual Polling
- **Pros**: Simple implementation, works with any backend
- **Cons**: Inefficient, poor real-time experience, battery drain

### WebSocket Only (No Local Persistence)
- **Pros**: Real-time updates, simple state management
- **Cons**: No offline support, data loss on connection issues

## Implementation Notes

### Data Flow Architecture
```
User Action → Local State → UI Update → Background Sync → Supabase → Other Clients
     ↑                                                        ↓
     └── Conflict Resolution ←── Real-time Updates ←──────────┘
```

### Sync State Management
```typescript
interface SyncState {
  // Connection status
  isOnline: boolean;
  isConnected: boolean;
  lastSyncTimestamp: number;
  
  // Pending operations
  pendingOperations: PendingOperation[];
  syncInProgress: boolean;
  
  // Conflict resolution
  conflictResolution: 'manual' | 'auto-merge' | 'last-write-wins';
}
```

### Optimistic Updates Pattern
```typescript
const useOptimisticUpdate = () => {
  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    // 1. Optimistic local update
    updateLocalSubscription(id, updates);
    
    try {
      // 2. Send to server
      await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id);
    } catch (error) {
      // 3. Rollback on failure
      revertLocalSubscription(id);
      showErrorToast('Update failed, changes reverted');
    }
  };
};
```

### Real-time Subscription Setup
```typescript
const useRealtimeSync = (userId: string) => {
  useEffect(() => {
    const channel = supabase
      .channel(`subscriptions:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`
        },
        handleRealtimeChange
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);
};
```

### Conflict Resolution Strategy
- **Timestamp-based**: Use `updated_at` timestamp for conflict resolution
- **Last-write-wins**: Most recent change takes precedence
- **Field-level merging**: For complex objects, merge non-conflicting fields
- **User notification**: Inform users when conflicts are resolved

### Offline Queue Management
```typescript
interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

const queueOperation = (operation: Omit<PendingOperation, 'id' | 'timestamp'>) => {
  const pendingOp: PendingOperation = {
    ...operation,
    id: generateId(),
    timestamp: Date.now()
  };
  
  addToPendingQueue(pendingOp);
  
  // Try to sync immediately if online
  if (isOnline) {
    processPendingQueue();
  }
};
```

### Performance Optimizations

#### Batching Updates
```typescript
const batchUpdates = (operations: PendingOperation[]) => {
  // Group operations by type and table
  const batches = groupOperationsByTable(operations);
  
  // Execute batches in parallel
  return Promise.all(
    batches.map(batch => executeBatchOperation(batch))
  );
};
```

#### Selective Subscriptions
```typescript
// Only subscribe to necessary data channels
const subscribeToUserData = (userId: string) => {
  return supabase
    .channel(`user_${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'subscriptions',
      filter: `user_id=eq.${userId}`
    }, handleSubscriptionChange)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'user_settings',
      filter: `user_id=eq.${userId}`
    }, handleSettingsChange)
    .subscribe();
};
```

### Error Handling and Recovery

#### Connection Management
```typescript
const useConnectionManager = () => {
  const [connectionState, setConnectionState] = useState({
    status: 'connecting',
    retryCount: 0,
    lastError: null
  });

  const handleConnectionError = (error: Error) => {
    console.error('Sync connection error:', error);
    
    // Exponential backoff retry
    const backoffDelay = Math.min(1000 * Math.pow(2, connectionState.retryCount), 30000);
    
    setTimeout(() => {
      reconnect();
    }, backoffDelay);
  };
};
```

#### Data Consistency Checks
```typescript
const validateDataConsistency = async () => {
  const localHash = calculateDataHash(localSubscriptions);
  const serverHash = await fetchServerDataHash();
  
  if (localHash !== serverHash) {
    console.warn('Data inconsistency detected, triggering full sync');
    await performFullSync();
  }
};
```

### User Experience Considerations

#### Status Indicators
- **Online/Offline indicator**: Clear visual feedback of connection status
- **Sync progress**: Show when data is being synchronized
- **Conflict notifications**: Inform users when conflicts are resolved
- **Pending changes**: Indicate when changes are waiting to sync

#### Performance Metrics
- **Sync latency**: Time from local change to server propagation
- **Conflict frequency**: How often conflicts occur and are resolved
- **Offline capability**: Time app remains functional without connection
- **Memory usage**: Impact of local caching on device resources

### Testing Strategy

#### Unit Tests
- Test optimistic update rollback scenarios
- Test conflict resolution algorithms
- Test offline queue management

#### Integration Tests
- Test real-time sync across multiple clients
- Test offline-to-online transition scenarios
- Test network failure recovery

#### End-to-End Tests
- Test multi-device synchronization
- Test extended offline usage
- Test conflict resolution user experience

## References
- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [Local-First Software Principles](https://www.inkandswitch.com/local-first/)
- [Offline-First Database Patterns](https://hasura.io/blog/design-guide-first-party-cookie-based-authentication/)
- [Optimistic UI Patterns](https://ux.shopify.com/how-to-make-your-ui-feel-more-responsive-4285b14968c0)
- [Original Sync Issues](../../DEBUGGING_PLAN.md#memory-leak-detection)
