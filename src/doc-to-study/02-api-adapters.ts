/**
 * TanStack DB API Adapters
 *
 * These adapters sync TanStack DB collections with your REST API.
 * They handle:
 * - Loading data from API into collections
 * - Optimistic updates (instant UI updates)
 * - Automatic rollback on errors
 * - Syncing with server
 */

import { dispatchesCollection, parcelsCollection, readyForDispatchCollection } from "./01-database-setup";
import api from "@/api/api";
import type { Dispatch } from "@/data/types";
import type { Parcel, ReadyForDispatchParcel } from "./01-database-setup";

// ============================================================================
// Load Adapters (Read Operations)
// ============================================================================

/**
 * Load a dispatch by ID from API and sync to TanStack DB
 *
 * This loads the dispatch and all its parcels into the collections.
 * Components using live queries will automatically update.
 */
export const loadDispatchById = async (dispatchId: number): Promise<void> => {
   const response = await api.dispatch.getById(dispatchId);

   // Add dispatch to collection
   dispatchesCollection.set(response);

   // Add parcels to collection
   if (response.parcels) {
      const parcels: Parcel[] = response.parcels.map((p: any) => ({
         id: p.id,
         tracking_number: p.tracking_number,
         hbl: p.hbl || p.tracking_number,
         order_id: p.order_id,
         description: p.description,
         weight: p.weight,
         status: p.status,
         dispatch_id: dispatchId,
         updated_at: p.updated_at ? new Date(p.updated_at) : new Date(),
         created_at: p.created_at ? new Date(p.created_at) : new Date(),
      }));

      parcelsCollection.set(...parcels);
   }
};

/**
 * Load ready-for-dispatch parcels from API and sync to TanStack DB
 */
export const loadReadyForDispatch = async (agencyId: number): Promise<void> => {
   const response = await api.dispatch.readyForDispatch();

   if (response.rows) {
      const parcels: ReadyForDispatchParcel[] = response.rows.map((p: any) => ({
         id: p.id,
         hbl: p.hbl,
         tracking_number: p.tracking_number,
         order_id: p.order_id,
         description: p.description,
         weight: p.weight,
      }));

      readyForDispatchCollection.set(...parcels);
   }
};

// ============================================================================
// Mutation Adapters (Write Operations with Optimistic Updates)
// ============================================================================

/**
 * Add a parcel to a dispatch
 *
 * This performs an optimistic update:
 * 1. Immediately adds parcel to collection (instant UI update)
 * 2. Syncs with server
 * 3. Replaces optimistic parcel with real one from server
 * 4. Automatically rolls back on error
 */
export const addParcelToDispatch = async (dispatchId: number, hbl: string): Promise<Parcel> => {
   // Step 1: Optimistic update - add immediately for instant UI feedback
   const optimisticParcel: Parcel = {
      id: Date.now(), // Temporary ID (will be replaced by server)
      tracking_number: hbl,
      hbl: hbl,
      order_id: 0,
      description: "",
      status: "pending",
      dispatch_id: dispatchId,
      updated_at: new Date(),
      created_at: new Date(),
   };

   // Add to collection immediately (UI updates instantly!)
   parcelsCollection.set(optimisticParcel);

   try {
      // Step 2: Sync with server
      const response = await api.dispatch.addParcel(dispatchId, hbl);

      // Step 3: Replace optimistic parcel with real one from server
      if (response.parcel) {
         const realParcel: Parcel = {
            id: response.parcel.id,
            tracking_number: response.parcel.tracking_number || hbl,
            hbl: response.parcel.hbl || hbl,
            order_id: response.parcel.order_id,
            description: response.parcel.description,
            weight: response.parcel.weight,
            status: response.parcel.status,
            dispatch_id: dispatchId,
            updated_at: new Date(response.parcel.updated_at),
            created_at: response.parcel.created_at ? new Date(response.parcel.created_at) : new Date(),
         };

         // Remove optimistic parcel and add real one
         parcelsCollection.remove(optimisticParcel.id);
         parcelsCollection.set(realParcel);

         // Remove from ready-for-dispatch collection if it exists
         readyForDispatchCollection.remove((p) => p.hbl === hbl || p.tracking_number === hbl);

         return realParcel;
      }

      // If server doesn't return parcel, keep optimistic one
      return optimisticParcel;
   } catch (error) {
      // Step 4: Automatic rollback on error
      parcelsCollection.remove(optimisticParcel.id);
      throw error;
   }
};

/**
 * Remove a parcel from a dispatch
 *
 * Optimistic update that:
 * 1. Immediately removes parcel (instant UI update)
 * 2. Syncs with server
 * 3. Adds parcel back to ready-for-dispatch if removal succeeds
 * 4. Automatically rolls back on error
 */
export const removeParcelFromDispatch = async (dispatchId: number, trackingNumber: string): Promise<void> => {
   // Find parcel to restore if needed
   const parcel = parcelsCollection.findOne(
      (p) => (p.tracking_number === trackingNumber || p.hbl === trackingNumber) && p.dispatch_id === dispatchId
   );

   // Step 1: Optimistic update - remove immediately
   parcelsCollection.remove(
      (p) => (p.tracking_number === trackingNumber || p.hbl === trackingNumber) && p.dispatch_id === dispatchId
   );

   try {
      // Step 2: Sync with server
      await api.dispatch.removeParcel(dispatchId, trackingNumber);

      // Step 3: Add parcel back to ready-for-dispatch if it existed
      if (parcel) {
         readyForDispatchCollection.set({
            id: parcel.id,
            hbl: parcel.hbl,
            tracking_number: parcel.tracking_number,
            order_id: parcel.order_id,
            description: parcel.description || "",
            weight: parcel.weight || 0,
         });
      }
   } catch (error) {
      // Step 4: Automatic rollback on error
      if (parcel) {
         parcelsCollection.set(parcel);
      }
      throw error;
   }
};
