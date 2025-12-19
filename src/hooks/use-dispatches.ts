import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { queryClient } from "@/lib/query-client";
import type { ParcelStatus } from "@/data/types";

export const useDispatches = {
   get: (page: number, limit: number) => {
      return useQuery({
         queryKey: ["dispatches", page, limit],
         queryFn: () => api.dispatch.get(page, limit),
      });
   },
   create: () => {
      return useMutation({
         mutationFn: () => api.dispatch.create(),
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dispatches"] });
            queryClient.refetchQueries({ queryKey: ["dispatches"] });
         },
      });
   },

   addItem: (dispatch_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ hbl }: { hbl: string }) => api.dispatch.addParcel(dispatch_id, hbl),
         onMutate: async ({ hbl }) => {
            // Cancel outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: ["get-dispatch-by-id", dispatch_id] });
            await queryClient.cancelQueries({ queryKey: ["ready-for-dispatch", agency_id] });
            await queryClient.cancelQueries({ queryKey: ["dispatch-parcels", dispatch_id] });

            // Snapshot previous values
            const previousDispatch = queryClient.getQueryData(["get-dispatch-by-id", dispatch_id]);
            const previousReadyForDispatch = queryClient.getQueryData(["ready-for-dispatch", agency_id]);
            const previousDispatchParcels = queryClient.getQueryData(["dispatch-parcels", dispatch_id]);

            // Optimistically update dispatch cache
            queryClient.setQueryData(["get-dispatch-by-id", dispatch_id], (old: any) => {
               if (!old) return old;
               const newParcel = {
                  id: Date.now(), // Temporary ID
                  tracking_number: hbl,
                  hbl: hbl,
                  order_id: 0, // Will be updated on success
                  description: "",
                  status: "PENDING_SYNC",
                  updated_at: new Date().toISOString(),
               };
               return {
                  ...old,
                  parcels: [newParcel, ...(old.parcels || [])],
                  _count: {
                     ...old._count,
                     parcels: (old._count?.parcels || 0) + 1,
                  },
               };
            });

            // Optimistically update ready-for-dispatch cache (remove from list)
            // For infinite queries, update all pages
            queryClient.setQueryData(["ready-for-dispatch", agency_id], (old: any) => {
               if (!old?.pages) return old;
               let itemRemoved = false;
               const updatedPages = old.pages.map((page: any, index: number) => {
                  const filteredRows =
                     page?.rows?.filter((pkg: any) => {
                        if (pkg.hbl === hbl || pkg.tracking_number === hbl) {
                           if (!itemRemoved) itemRemoved = true;
                           return false;
                        }
                        return true;
                     }) || [];
                  return {
                     ...page,
                     rows: filteredRows,
                     total: index === 0 && itemRemoved ? Math.max(0, (page?.total || 0) - 1) : page?.total,
                  };
               });

               return {
                  ...old,
                  pages: updatedPages,
               };
            });

            // Optimistically update dispatch parcels cache (add to list)
            queryClient.setQueryData(["dispatch-parcels", dispatch_id], (old: any) => {
               if (!old?.pages) return old;
               const newParcel = {
                  id: Date.now(),
                  tracking_number: hbl,
                  hbl: hbl,
                  order_id: 0,
                  description: "",
                  status: "PENDING_SYNC",
                  updated_at: new Date().toISOString(),
               };
               return {
                  ...old,
                  pages: old.pages.map((page: any, index: number) => {
                     if (index === 0) {
                        return {
                           ...page,
                           rows: [newParcel, ...(page?.rows || [])],
                           total: (page?.total || 0) + 1,
                        };
                     }
                     return page;
                  }),
               };
            });

            return { previousDispatch, previousReadyForDispatch, previousDispatchParcels };
         },
         onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousDispatch) {
               queryClient.setQueryData(["get-dispatch-by-id", dispatch_id], context.previousDispatch);
            }
            if (context?.previousReadyForDispatch) {
               queryClient.setQueryData(["ready-for-dispatch", agency_id], context.previousReadyForDispatch);
            }
            if (context?.previousDispatchParcels) {
               queryClient.setQueryData(["dispatch-parcels", dispatch_id], context.previousDispatchParcels);
            }
         },
         onSuccess: async () => {
            // After successful mutation, invalidate and refetch queries to get fresh data
            // This ensures remaining items are loaded after optimistic removals
            await queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch", agency_id] });
            await queryClient.refetchQueries({ queryKey: ["ready-for-dispatch", agency_id] });
            await queryClient.invalidateQueries({ queryKey: ["dispatch-parcels", dispatch_id] });
            await queryClient.refetchQueries({ queryKey: ["dispatch-parcels", dispatch_id] });
         },
      });
   },
   readyForDispatch: (agency_id: number, limit: number = 20) => {
      return useInfiniteQuery({
         queryKey: ["ready-for-dispatch", agency_id],
         queryFn: ({ pageParam = 1 }) => api.dispatch.readyForDispatch(pageParam, limit),
         enabled: !!agency_id,
         getNextPageParam: (lastPage, allPages) => {
            const currentPage = allPages.length;
            const totalRows = lastPage?.total ?? 0;
            const rowsInLastPage = lastPage?.rows?.length ?? 0;

            // If we got fewer rows than the limit, we've reached the end
            if (rowsInLastPage < limit) {
               return undefined;
            }

            // Otherwise, check if there are more pages based on total
            const totalPages = Math.ceil(totalRows / limit);
            return currentPage < totalPages ? currentPage + 1 : undefined;
         },
         initialPageParam: 1,
      });
   },
   getParcelsByDispatchId: (dispatch_id: number, limit: number = 20, status: ParcelStatus | undefined) => {
      return useInfiniteQuery({
         queryKey: ["dispatch-parcels", dispatch_id, status],
         queryFn: ({ pageParam = 0 }) => api.dispatch.getParcelsByDispatchId(dispatch_id, pageParam, limit, status),
         enabled: !!dispatch_id,
         getNextPageParam: (lastPage, allPages) => {
            const currentPage = allPages.length;
            const totalRows = lastPage?.total ?? 0;
            const rowsInLastPage = lastPage?.rows?.length ?? 0;

            // If we got fewer rows than the limit, we've reached the end
            if (rowsInLastPage < limit) {
               return undefined;
            }

            // Otherwise, check if there are more pages based on total
            // Return 0-based page number (currentPage is already 0-based since it's allPages.length)
            const totalPages = Math.ceil(totalRows / limit);
            return currentPage < totalPages ? currentPage : undefined;
         },
         initialPageParam: 0,
      });
   },
   removeParcel: (dispatch_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ tracking_number }: { tracking_number: string }) =>
            api.dispatch.removeParcel(dispatch_id, tracking_number),
         onMutate: async ({ tracking_number }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["get-dispatch-by-id", dispatch_id] });
            await queryClient.cancelQueries({ queryKey: ["ready-for-dispatch", agency_id] });
            await queryClient.cancelQueries({ queryKey: ["dispatch-parcels", dispatch_id] });

            // Snapshot previous values
            const previousDispatch = queryClient.getQueryData(["get-dispatch-by-id", dispatch_id]);
            const previousReadyForDispatch = queryClient.getQueryData(["ready-for-dispatch", agency_id]);
            const previousDispatchParcels = queryClient.getQueryData(["dispatch-parcels", dispatch_id]);

            // Find the parcel being removed to restore it later
            // Try to find from dispatch parcels infinite query first, then from getById
            const dispatchParcelsData = previousDispatchParcels as any;
            let parcelToRemove = dispatchParcelsData?.pages
               ?.flatMap((page: any) => page?.rows ?? [])
               ?.find((p: any) => p.tracking_number === tracking_number || p.hbl === tracking_number);

            if (!parcelToRemove) {
               parcelToRemove = (previousDispatch as any)?.parcels?.find(
                  (p: any) => p.tracking_number === tracking_number || p.hbl === tracking_number
               );
            }

            // Optimistically update dispatch cache (remove parcel)
            queryClient.setQueryData(["get-dispatch-by-id", dispatch_id], (old: any) => {
               if (!old) return old;
               return {
                  ...old,
                  parcels:
                     old.parcels?.filter(
                        (p: any) => p.tracking_number !== tracking_number && p.hbl !== tracking_number
                     ) || [],
                  _count: {
                     ...old._count,
                     parcels: Math.max(0, (old._count?.parcels || 0) - 1),
                  },
               };
            });

            // Optimistically update ready-for-dispatch cache (add back to list if parcel exists)
            // For infinite queries, add to the first page
            if (parcelToRemove) {
               queryClient.setQueryData(["ready-for-dispatch", agency_id], (old: any) => {
                  if (!old?.pages) return old;
                  // Check if already in list to avoid duplicates
                  const allRows = old.pages.flatMap((page: any) => page?.rows ?? []);
                  const alreadyExists = allRows.some(
                     (pkg: any) =>
                        pkg.hbl === parcelToRemove.hbl || pkg.tracking_number === parcelToRemove.tracking_number
                  );
                  if (alreadyExists) return old;
                  return {
                     ...old,
                     pages: old.pages.map((page: any, index: number) => {
                        if (index === 0) {
                           // Add to first page
                           return {
                              ...page,
                              rows: [...(page?.rows || []), parcelToRemove],
                              total: (page?.total || 0) + 1,
                           };
                        }
                        return page;
                     }),
                  };
               });
            }

            // Optimistically update dispatch parcels cache (remove from list)
            queryClient.setQueryData(["dispatch-parcels", dispatch_id], (old: any) => {
               if (!old?.pages) return old;
               let itemRemoved = false;
               return {
                  ...old,
                  pages: old.pages.map((page: any, index: number) => {
                     const filteredRows =
                        page?.rows?.filter((pkg: any) => {
                           if (pkg.tracking_number === tracking_number || pkg.hbl === tracking_number) {
                              if (!itemRemoved) itemRemoved = true;
                              return false;
                           }
                           return true;
                        }) || [];
                     return {
                        ...page,
                        rows: filteredRows,
                        total: index === 0 && itemRemoved ? Math.max(0, (page?.total || 0) - 1) : page?.total,
                     };
                  }),
               };
            });

            return { previousDispatch, previousReadyForDispatch, previousDispatchParcels };
         },
         onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousDispatch) {
               queryClient.setQueryData(["get-dispatch-by-id", dispatch_id], context.previousDispatch);
            }
            if (context?.previousReadyForDispatch) {
               queryClient.setQueryData(["ready-for-dispatch", agency_id], context.previousReadyForDispatch);
            }
            if (context?.previousDispatchParcels) {
               queryClient.setQueryData(["dispatch-parcels", dispatch_id], context.previousDispatchParcels);
            }
         },
         onSuccess: async () => {
            // After successful mutation, invalidate and refetch queries to get fresh data
            // This ensures items are properly updated after optimistic changes
            await queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch", agency_id] });
            await queryClient.refetchQueries({ queryKey: ["ready-for-dispatch", agency_id] });
            await queryClient.invalidateQueries({ queryKey: ["dispatch-parcels", dispatch_id] });
            await queryClient.refetchQueries({ queryKey: ["dispatch-parcels", dispatch_id] });
         },
      });
   },
   finishDispatch: (dispatch_id: number) => {
      return useMutation({
         mutationFn: () => api.dispatch.finishDispatch(dispatch_id),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["dispatches"] });
            await queryClient.refetchQueries({ queryKey: ["dispatches"] });
         },
         onError: (error) => {
            console.error(error);
         },
      });
   },
   deleteDispatch: () => {
      return useMutation({
         mutationFn: (dispatch_id: number) => api.dispatch.deleteDispatch(dispatch_id),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["dispatches"] });
            await queryClient.refetchQueries({ queryKey: ["dispatches"] });
         },
      });
   },
};
