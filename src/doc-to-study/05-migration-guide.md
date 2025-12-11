# TanStack DB Migration Guide

Step-by-step guide to migrate from React Query to TanStack DB for the dispatch scanning feature.

## Prerequisites

- Node.js 18+
- Existing React Query setup
- TypeScript

## Step 1: Installation

```bash
yarn add @tanstack/react-db
```

## Step 2: Create Database Setup

1. Create `src/lib/db.ts` (copy from `01-database-setup.ts`)
2. Define your types (Parcel, ReadyForDispatchParcel)
3. Create collections (dispatches, parcels, readyForDispatch)

## Step 3: Create API Adapters

1. Create `src/lib/db-adapters.ts` (copy from `02-api-adapters.ts`)
2. Implement load functions (loadDispatchById, loadReadyForDispatch)
3. Implement mutation functions with optimistic updates

## Step 4: Update Hooks

1. Update `src/hooks/use-dispatches.ts` (copy from `03-updated-hooks.ts`)
2. Replace manual optimistic updates with TanStack DB
3. Add live queries for reactive data

## Step 5: Update Components

1. Update components to use new hooks (see `04-component-examples.tsx`)
2. Remove manual refetching logic
3. Remove useEffect hooks for data syncing

## Step 6: Add DBProvider

Update `src/main.tsx`:

```typescript
import { DBProvider } from '@tanstack/react-db';
import { db } from '@/lib/db';

// Wrap your app
<DBProvider db={db}>
   <QueryClientProvider client={queryClient}>
      <App />
   </QueryClientProvider>
</DBProvider>
```

## Step 7: Test

1. Test scanning parcels (should be instant)
2. Test removing parcels (should be instant)
3. Test error scenarios (should rollback automatically)
4. Verify components update automatically

## Rollback Plan

If you need to rollback:

1. Keep old hooks in a backup file
2. Revert component changes
3. Remove TanStack DB dependency

## Common Issues

### Issue: Components not updating

**Solution**: Make sure DBProvider wraps your app and live queries are used correctly.

### Issue: Type errors

**Solution**: Ensure all types match between collections and API responses.

### Issue: Optimistic updates not working

**Solution**: Check that adapters are using `collection.set()` and `collection.remove()` correctly.

## Next Steps

After successful migration:

1. Consider migrating other features to TanStack DB
2. Add more indexes for better performance
3. Implement real-time sync if needed

