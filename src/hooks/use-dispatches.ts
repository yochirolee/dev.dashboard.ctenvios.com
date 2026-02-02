import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { queryClient } from "@/lib/query-client";

export const useDispatches = {
   get: (
      page: number,
      limit: number,
      status?: string,
      payment_status?: string,
      dispatch_id?: number,
      agency_id?: number
   ) => {
      return useQuery({
         queryKey: ["dispatches", page, limit, status, payment_status, dispatch_id, agency_id],
         queryFn: () => api.dispatch.get(page, limit, status, payment_status, dispatch_id, agency_id),
      });
   },
   create: () => {
      return useMutation({
         mutationFn: () => api.dispatch.create(),
         onSuccess: async () => {
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["dispatches"] })]);
         },
      });
   },

   addParcel: (dispatch_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ hbl }: { hbl: string }) => api.dispatch.addParcel(dispatch_id, hbl),
         onMutate: async ({ hbl }) => {
            await Promise.all([
               queryClient.cancelQueries({ queryKey: ["ready-for-dispatch", agency_id] }),
               queryClient.cancelQueries({ queryKey: ["parcels-in-dispatch", dispatch_id] }),
            ]);

            const previousReady = queryClient.getQueryData(["ready-for-dispatch", agency_id]);
            const previousDispatch = queryClient.getQueryData(["parcels-in-dispatch", dispatch_id]);
            const tracking = hbl.trim().toUpperCase();

            queryClient.setQueryData(["parcels-in-dispatch", dispatch_id], (data: any) => {
               if (!data?.pages?.length) return data;
               const [firstPage, ...restPages] = data.pages;
               const rows = firstPage?.rows ?? [];
               const exists = rows.some((row: any) => (row?.tracking_number ?? row?.hbl)?.toUpperCase() === tracking);
               if (exists) return data;

               const optimisticParcel = {
                  tracking_number: tracking,
                  hbl: tracking,
                  status: "CREATED",
               };

               const updatedFirstPage = {
                  ...firstPage,
                  rows: [optimisticParcel, ...rows],
                  total: (firstPage?.total ?? rows.length) + 1,
               };

               return {
                  ...data,
                  pages: [updatedFirstPage, ...restPages],
               };
            });

            queryClient.setQueryData(["ready-for-dispatch", agency_id], (data: any) => {
               if (!data?.pages?.length) return data;
               let removedCount = 0;
               const updatedPages = data.pages.map((page: any) => {
                  const rows = page?.rows ?? [];
                  const filtered = rows.filter(
                     (row: any) => (row?.tracking_number ?? row?.hbl)?.toUpperCase() !== tracking
                  );
                  removedCount += rows.length - filtered.length;
                  return { ...page, rows: filtered };
               });

               if (removedCount === 0) return data;

               return {
                  ...data,
                  pages: updatedPages.map((page: any) => ({
                     ...page,
                     total: Math.max(0, (page?.total ?? 0) - removedCount),
                  })),
               };
            });

            return { previousReady, previousDispatch };
         },
         onError: (_error, _variables, context) => {
            if (context?.previousReady) {
               queryClient.setQueryData(["ready-for-dispatch", agency_id], context.previousReady);
            }
            if (context?.previousDispatch) {
               queryClient.setQueryData(["parcels-in-dispatch", dispatch_id], context.previousDispatch);
            }
         },
         onSettled: async () => {
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch", agency_id] }),
               queryClient.invalidateQueries({ queryKey: ["parcels-in-dispatch", dispatch_id] }),
            ]);
         },
      });
   },
   addParcelsByOrderId: (dispatch_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ orderId }: { orderId: number }) => api.dispatch.addParcelsByOrderId(dispatch_id, orderId),
         onSuccess: async () => {
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["parcels-in-dispatch", dispatch_id] }),
               queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch", agency_id] }),
            ]);
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
            if (rowsInLastPage < limit) return undefined;
            const totalPages = Math.ceil(totalRows / limit);
            return currentPage < totalPages ? currentPage + 1 : undefined;
         },
         initialPageParam: 1,
      });
   },

   getParcelsByDispatchId: (dispatch_id: number, limit: number = 100) => {
      return useInfiniteQuery({
         queryKey: ["parcels-in-dispatch", dispatch_id],
         queryFn: ({ pageParam = 1 }) => api.dispatch.getParcelsByDispatchId(dispatch_id, pageParam, limit),
         enabled: !!dispatch_id,
         getNextPageParam: (lastPage, allPages) => {
            const currentPage = allPages.length;
            const totalRows = lastPage?.total ?? 0;
            const rowsInLastPage = lastPage?.rows?.length ?? 0;
            if (rowsInLastPage < limit) return undefined;
            const totalPages = Math.ceil(totalRows / limit);
            return currentPage < totalPages ? currentPage + 1 : undefined;
         },
         initialPageParam: 1,
      });
   },

   removeParcel: (dispatch_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ tracking_number }: { tracking_number: string }) =>
            api.dispatch.removeParcel(dispatch_id, tracking_number),
         onSuccess: async () => {
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch", agency_id] }),
               queryClient.invalidateQueries({ queryKey: ["parcels-in-dispatch", dispatch_id] }),
            ]);
         },
      });
   },

   finishDispatch: (dispatch_id: number) => {
      return useMutation({
         mutationFn: () => api.dispatch.finishDispatch(dispatch_id),
         onSuccess: async () => {
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["dispatches"] })]);
         },
         onError: (error) => {
            console.error(error);
         },
      });
   },

   finalizeCreate: (dispatch_id: number) => {
      return useMutation({
         mutationFn: () => api.dispatch.finalizeCreate(dispatch_id),
         onSuccess: async () => {
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["dispatches"] }),
               queryClient.invalidateQueries({ queryKey: ["parcels-in-dispatch", dispatch_id] }),
            ]);
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
            await Promise.all([queryClient.invalidateQueries({ queryKey: ["dispatches"] })]);
         },
      });
   },

   createFromParcels: () => {
      return useMutation({
         mutationFn: (tracking_numbers: string[]) => api.dispatch.createFromParcels(tracking_numbers),
         onSuccess: async () => {
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["dispatches"] }),
               queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch"] }),
               queryClient.refetchQueries({ queryKey: ["ready-for-dispatch"] }),
            ]);
         },
      });
   },

   getById: (dispatch_id: number) => {
      return useQuery({
         queryKey: ["dispatch-by-id", dispatch_id],
         queryFn: () => api.dispatch.getById(dispatch_id),
         enabled: !!dispatch_id && dispatch_id > 0,
         retry: false,
      });
   },

   receiveParcel: (dispatch_id: number) => {
      return useMutation({
         mutationFn: ({ tracking_number }: { tracking_number: string }) =>
            api.dispatch.receiveParcel(dispatch_id, tracking_number),
         onSuccess: async () => {
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["dispatch-by-id", dispatch_id] }),
               queryClient.invalidateQueries({ queryKey: ["dispatch-parcels", dispatch_id] }),
            ]);
         },
      });
   },

   completeReceive: (dispatch_id: number) => {
      return useMutation({
         mutationFn: () => api.dispatch.completeReceive(dispatch_id),
         onSuccess: async () => {
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["dispatches"] }),
               queryClient.invalidateQueries({ queryKey: ["dispatch-by-id", dispatch_id] }),
            ]);
         },
      });
   },

   verifyParcel: () => {
      return useMutation({
         mutationFn: (tracking_number: string) => api.dispatch.verifyParcel(tracking_number),
      });
   },

   smartReceive: () => {
      return useMutation({
         mutationFn: (tracking_numbers: string[]) => api.dispatch.smartReceive(tracking_numbers),
         onSuccess: async () => {
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["dispatches"] }),
               queryClient.refetchQueries({ queryKey: ["dispatches"] }),
               queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch"] }),
               queryClient.refetchQueries({ queryKey: ["ready-for-dispatch"] }),
            ]);
         },
      });
   },
};
