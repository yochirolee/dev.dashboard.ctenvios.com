/**
 * TanStack DB Database Setup
 * 
 * This file sets up the TanStack DB instance and defines collections
 * for dispatches, parcels, and ready-for-dispatch parcels.
 * 
 * Collections are like tables in a database - they store typed objects
 * and support indexes for fast queries.
 */

import { createDB, createCollection } from '@tanstack/react-db';
import type { Dispatch } from '@/data/types';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Parcel type for parcels in a dispatch
 */
export interface Parcel {
   id: number;
   tracking_number: string;
   hbl: string;
   order_id: number;
   description?: string;
   weight?: number;
   status: string;
   dispatch_id: number;
   updated_at?: Date;
   created_at?: Date;
}

/**
 * Parcel type for parcels ready to be dispatched
 */
export interface ReadyForDispatchParcel {
   id: number;
   hbl: string;
   tracking_number: string;
   order_id: number;
   description: string;
   weight: number;
}

// ============================================================================
// Database Instance
// ============================================================================

/**
 * Create the main database instance
 * This is the root of your data store
 */
export const db = createDB({
   onError: (error) => {
      console.error('TanStack DB Error:', error);
      // You can add error reporting here (e.g., Sentry)
   },
});

// ============================================================================
// Collections
// ============================================================================

/**
 * Dispatches collection
 * Stores dispatch/despacho records
 */
export const dispatchesCollection = createCollection<Dispatch>(db, {
   name: 'dispatches',
   primaryKey: 'id',
});

/**
 * Parcels collection
 * Stores parcels/paquetes that are in dispatches
 * 
 * Indexes allow fast queries:
 * - dispatch_id: Find all parcels in a dispatch
 * - tracking_number: Find parcel by tracking number
 * - hbl: Find parcel by HBL
 */
export const parcelsCollection = createCollection<Parcel>(db, {
   name: 'parcels',
   primaryKey: 'id',
   indexes: ['dispatch_id', 'tracking_number', 'hbl'],
});

/**
 * Ready-for-dispatch collection
 * Stores parcels that are ready to be added to a dispatch
 */
export const readyForDispatchCollection = createCollection<ReadyForDispatchParcel>(db, {
   name: 'readyForDispatch',
   primaryKey: 'id',
   indexes: ['hbl', 'tracking_number'],
});

// ============================================================================
// Export everything
// ============================================================================

export type { Parcel, ReadyForDispatchParcel };

