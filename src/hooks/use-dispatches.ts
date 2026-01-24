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
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["dispatches"] }),
               queryClient.refetchQueries({ queryKey: ["dispatches"] }),
            ]);
         },
      });
   },

   addItem: (dispatch_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ hbl }: { hbl: string }) => api.dispatch.addParcel(dispatch_id, hbl),
         onSuccess: async () => {
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch", agency_id] }),
               queryClient.refetchQueries({ queryKey: ["ready-for-dispatch", agency_id] }),
               queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch-all", agency_id] }),
               queryClient.refetchQueries({ queryKey: ["ready-for-dispatch-all", agency_id] }),
               queryClient.invalidateQueries({ queryKey: ["dispatch-parcels", dispatch_id] }),
               queryClient.refetchQueries({ queryKey: ["dispatch-parcels", dispatch_id] }),
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

   readyForDispatchAll: (agency_id: number, limit: number = 100) => {
      return useInfiniteQuery({
         queryKey: ["ready-for-dispatch-all", agency_id],
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
         queryKey: ["dispatch-parcels", dispatch_id],
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
               queryClient.refetchQueries({ queryKey: ["ready-for-dispatch", agency_id] }),
               queryClient.invalidateQueries({ queryKey: ["ready-for-dispatch-all", agency_id] }),
               queryClient.refetchQueries({ queryKey: ["ready-for-dispatch-all", agency_id] }),
               queryClient.invalidateQueries({ queryKey: ["dispatch-parcels", dispatch_id] }),
               queryClient.refetchQueries({ queryKey: ["dispatch-parcels", dispatch_id] }),
            ]);
         },
      });
   },

   finishDispatch: (dispatch_id: number) => {
      return useMutation({
         mutationFn: () => api.dispatch.finishDispatch(dispatch_id),
         onSuccess: async () => {
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["dispatches"] }),
               queryClient.refetchQueries({ queryKey: ["dispatches"] }),
            ]);
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
               queryClient.refetchQueries({ queryKey: ["dispatches"] }),
               queryClient.invalidateQueries({ queryKey: ["dispatch-parcels", dispatch_id] }),
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
            await Promise.all([
               queryClient.invalidateQueries({ queryKey: ["dispatches"] }),
               queryClient.refetchQueries({ queryKey: ["dispatches"] }),
            ]);
         },
      });
   },

   createFromParcels: () => {
      return useMutation({
         mutationFn: (tracking_numbers: string[]) => api.dispatch.createFromParcels(tracking_numbers),
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
