/**
 * Improved version of use-dispatches with better TypeScript typing
 * This is a reference implementation showing how to improve the current code
 */

import { useMutation } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import api from "@/api/api";
import { queryClient } from "@/lib/query-client";

// ============================================================================
// Types
// ============================================================================

interface Parcel {
   id: number | string;
   tracking_number: string;
   hbl: string;
   order_id: number;
   description: string;
   status: string;
   updated_at: string | Date;
   weight?: number;
}

interface Dispatch {
   id: number;
   parcels: Parcel[];
   _count: { parcels: number };
}

interface Page<T> {
   rows: T[];
   total: number;
   page?: number;
   limit?: number;
}

interface ReadyRow {
   hbl: string;
   tracking_number: string;
   id: number;
   order_id: number;
   description: string;
   weight: number;
}

type ReadyForDispatchInfinite = InfiniteData<Page<ReadyRow>>;
type DispatchParcelsInfinite = InfiniteData<Page<Parcel>>;

interface AddItemVariables {
   hbl: string;
}

interface AddItemContext {
   previousDispatch?: Dispatch | undefined;
   previousReadyForDispatch?: ReadyForDispatchInfinite | undefined;
   previousDispatchParcels?: DispatchParcelsInfinite | undefined;
   tempId: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const buildOptimisticParcel = (hbl: string, tempId: string): Parcel => ({
   id: tempId,
   tracking_number: hbl,
   hbl,
   order_id: 0,
   description: "",
   status: "pending",
   updated_at: new Date().toISOString(),
});

// ============================================================================
// Hooks
// ============================================================================

export const useDispatchesImproved = {
   addItem: (dispatch_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ hbl }: AddItemVariables) => api.dispatch.addParcel(dispatch_id, hbl),

         onMutate: async ({ hbl }): Promise<AddItemContext> => {
            // Cancel outgoing refetches in parallel
            await Promise.all([
               queryClient.cancelQueries({ queryKey: ["get-dispatch-by-id", dispatch_id] }),
               queryClient.cancelQueries({ queryKey: ["ready-for-dispatch", agency_id] }),
               queryClient.cancelQueries({ queryKey: ["dispatch-parcels", dispatch_id] }),
            ]);

            // Snapshot previous values
            const previousDispatch = queryClient.getQueryData<Dispatch>(["get-dispatch-by-id", dispatch_id]);
            const previousReadyForDispatch = queryClient.getQueryData<ReadyForDispatchInfinite>([
               "ready-for-dispatch",
               agency_id,
            ]);
            const previousDispatchParcels = queryClient.getQueryData<DispatchParcelsInfinite>([
               "dispatch-parcels",
               dispatch_id,
            ]);

            const tempId = `optimistic-${Date.now()}`;
            const optimisticParcel = buildOptimisticParcel(hbl, tempId);

            // 1) Optimistic update for dispatch
            if (previousDispatch) {
               queryClient.setQueryData<Dispatch>(["get-dispatch-by-id", dispatch_id], (old) => {
                  if (!old) return old;
                  return {
                     ...old,
                     parcels: [optimisticParcel, ...(old.parcels ?? [])],
                     _count: {
                        ...old._count,
                        parcels: (old._count?.parcels ?? 0) + 1,
                     },
                  };
               });
            }

            // 2) Optimistic update ready-for-dispatch (remove from list)
            if (previousReadyForDispatch) {
               queryClient.setQueryData<ReadyForDispatchInfinite>(["ready-for-dispatch", agency_id], (old) => {
                  if (!old?.pages) return old;

                  let itemRemoved = false;
                  return {
                     ...old,
                     pages: old.pages.map((page, index) => {
                        const filteredRows =
                           page?.rows?.filter((pkg) => {
                              if (pkg.hbl === hbl || pkg.tracking_number === hbl) {
                                 if (!itemRemoved) itemRemoved = true;
                                 return false;
                              }
                              return true;
                           }) ?? [];

                        return {
                           ...page,
                           rows: filteredRows,
                           total: index === 0 && itemRemoved ? Math.max(0, (page?.total ?? 0) - 1) : page?.total,
                        };
                     }),
                  };
               });
            }

            // 3) Optimistic update dispatch-parcels (add to first page)
            if (previousDispatchParcels) {
               queryClient.setQueryData<DispatchParcelsInfinite>(["dispatch-parcels", dispatch_id], (old) => {
                  if (!old?.pages) return old;

                  return {
                     ...old,
                     pages: old.pages.map((page, index) => {
                        if (index !== 0) return page;
                        return {
                           ...page,
                           rows: [optimisticParcel, ...(page?.rows ?? [])],
                           total: (page?.total ?? 0) + 1,
                        };
                     }),
                  };
               });
            }

            return {
               previousDispatch,
               previousReadyForDispatch,
               previousDispatchParcels,
               tempId,
            };
         },

         onError: (_err, _variables, context) => {
            if (!context) return;

            const { previousDispatch, previousReadyForDispatch, previousDispatchParcels } = context;

            if (previousDispatch) {
               queryClient.setQueryData(["get-dispatch-by-id", dispatch_id], previousDispatch);
            }
            if (previousReadyForDispatch) {
               queryClient.setQueryData(["ready-for-dispatch", agency_id], previousReadyForDispatch);
            }
            if (previousDispatchParcels) {
               queryClient.setQueryData(["dispatch-parcels", dispatch_id], previousDispatchParcels);
            }
         },

         onSuccess: async () => {
            // After successful mutation, invalidate queries to get fresh data
            // This ensures remaining items are loaded after optimistic removals
            //
            // Why onSuccess instead of onSettled?
            // - onSuccess: Only runs on success (what we want)
            // - onSettled: Runs on both success AND error (we don't want to refetch on error)
            //
            // Why only invalidate (not refetch)?
            // - invalidateQueries automatically triggers refetch for active queries
            // - No need to call both invalidateQueries AND refetchQueries (redundant)
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch", agency_id] }),
               queryClient.invalidateQueries({ queryKey: ["dispatch-parcels", dispatch_id] }),
            ]);
         },
      });
   },
};
