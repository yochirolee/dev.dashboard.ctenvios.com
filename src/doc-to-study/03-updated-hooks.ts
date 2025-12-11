/**
 * Updated Hooks Using TanStack DB
 * 
 * This file shows how to update your existing hooks to use TanStack DB.
 * The main benefits:
 * - Live queries (automatic reactivity)
 * - Less boilerplate (no manual optimistic updates)
 * - Automatic rollback
 * - Better performance
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { useLiveQuery } from '@tanstack/react-db';
import { 
   parcelsCollection, 
   readyForDispatchCollection, 
   dispatchesCollection 
} from './01-database-setup';
import { 
   loadDispatchById, 
   loadReadyForDispatch, 
   addParcelToDispatch, 
   removeParcelFromDispatch 
} from './02-api-adapters';
import api from '@/api/api';

export const useDispatches = {
   /**
    * Get all dispatches (unchanged - can still use React Query)
    */
   get: () => {
      return useQuery({
         queryKey: ['dispatches'],
         queryFn: () => api.dispatch.get(0, 25),
      });
   },
   
   /**
    * Get dispatch by ID with live parcels
    * 
    * This hook:
    * 1. Loads dispatch data into TanStack DB
    * 2. Uses live query to get parcels (automatically reactive!)
    * 3. Returns combined data
    */
   getById: (dispatch_id: number) => {
      // Load data into DB (this runs once)
      const query = useQuery({
         queryKey: ['get-dispatch-by-id', dispatch_id],
         queryFn: () => loadDispatchById(dispatch_id),
         enabled: !!dispatch_id,
      });
      
      // Live query for parcels - automatically updates when parcels change!
      const parcels = useLiveQuery(
         parcelsCollection,
         (parcels) => parcels.filter((p) => p.dispatch_id === dispatch_id)
      );
      
      // Get dispatch from collection
      const dispatch = dispatchesCollection.findOne((d) => d.id === dispatch_id);
      
      return {
         ...query,
         data: dispatch ? {
            ...dispatch,
            parcels: parcels || [],
            _count: {
               parcels: parcels?.length || 0,
            },
         } : undefined,
      };
   },
   
   /**
    * Add item to dispatch
    * 
    * Much simpler than before! No need for:
    * - onMutate (optimistic updates handled in adapter)
    * - onError rollback (handled in adapter)
    * - Manual cache updates
    */
   addItem: (dispatch_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ hbl }: { hbl: string }) => 
            addParcelToDispatch(dispatch_id, hbl),
         // That's it! TanStack DB handles everything else
      });
   },
   
   /**
    * Get ready-for-dispatch parcels with live query
    * 
    * This automatically updates when parcels are added/removed!
    */
   readyForDispatch: (agency_id: number) => {
      // Load data into DB
      const query = useQuery({
         queryKey: ['ready-for-dispatch', agency_id],
         queryFn: () => loadReadyForDispatch(agency_id),
         enabled: !!agency_id,
      });
      
      // Live query - automatically reactive!
      // This will update automatically when parcels are added/removed
      const parcels = useLiveQuery(readyForDispatchCollection);
      
      return {
         ...query,
         data: {
            rows: parcels || [],
            total: parcels?.length || 0,
         },
      };
   },
   
   /**
    * Remove parcel from dispatch
    * 
    * Simple mutation - TanStack DB handles optimistic updates and rollback
    */
   removeParcel: (dispatch_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ tracking_number }: { tracking_number: string }) =>
            removeParcelFromDispatch(dispatch_id, tracking_number),
         // TanStack DB handles optimistic updates and rollback automatically
      });
   },
};

