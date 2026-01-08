import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { queryClient } from "@/lib/query-client";

export const useContainers = {
   get: (page: number, limit: number) => {
      return useQuery({
         queryKey: ["containers", page, limit],
         queryFn: () => api.containers.get(page, limit),
      });
   },

   getById: (id: number) => {
      return useQuery({
         queryKey: ["container", id],
         queryFn: () => api.containers.getById(id),
         enabled: !!id,
      });
   },

   create: () => {
      return useMutation({
         mutationFn: (data: any) => api.containers.create(data),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["containers"] });
         },
      });
   },

   update: () => {
      return useMutation({
         mutationFn: ({ id, data }: { id: number; data: any }) => api.containers.update(id, data),
         onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["containers"] });
            await queryClient.invalidateQueries({ queryKey: ["container", variables.id] });
         },
      });
   },

   updateStatus: () => {
      return useMutation({
         mutationFn: ({
            id,
            data,
         }: {
            id: number;
            data: { status: string; location?: string; description?: string };
         }) => api.containers.updateStatus(id, data),
         onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["containers"] });
            await queryClient.invalidateQueries({ queryKey: ["container", variables.id] });
         },
      });
   },

   delete: () => {
      return useMutation({
         mutationFn: (id: number) => api.containers.delete(id),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["containers"] });
         },
      });
   },

   addParcel: (containerId: number) => {
      return useMutation({
         mutationFn: ({ trackingNumber }: { trackingNumber: string }) =>
            api.containers.addParcel(containerId, trackingNumber),
         onMutate: async ({ trackingNumber }) => {
            await queryClient.cancelQueries({ queryKey: ["container", containerId] });
            await queryClient.cancelQueries({ queryKey: ["container-parcels", containerId] });
            await queryClient.cancelQueries({ queryKey: ["ready-for-container"] });

            const previousContainer = queryClient.getQueryData(["container", containerId]);
            const previousParcels = queryClient.getQueryData(["container-parcels", containerId]);
            const previousReadyForContainer = queryClient.getQueryData(["ready-for-container"]);

            // Optimistically update container parcel count
            queryClient.setQueryData(["container", containerId], (old: any) => {
               if (!old) return old;
               return {
                  ...old,
                  _count: {
                     ...old._count,
                     parcels: (old._count?.parcels || 0) + 1,
                  },
               };
            });

            // Optimistically add parcel to container parcels list
            queryClient.setQueryData(["container-parcels", containerId], (old: any) => {
               if (!old?.pages) return old;
               const newParcel = {
                  id: Date.now(),
                  tracking_number: trackingNumber,
                  order_id: 0,
                  description: "",
                  status: "IN_CONTAINER",
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

            // Optimistically remove from ready-for-container list
            queryClient.setQueryData(["ready-for-container"], (old: any) => {
               if (!old?.pages) return old;
               return {
                  ...old,
                  pages: old.pages.map((page: any, index: number) => {
                     const filteredRows =
                        page?.rows?.filter((pkg: any) => pkg.tracking_number !== trackingNumber) || [];
                     return {
                        ...page,
                        rows: filteredRows,
                        total: index === 0 ? Math.max(0, (page?.total || 0) - 1) : page?.total,
                     };
                  }),
               };
            });

            return { previousContainer, previousParcels, previousReadyForContainer };
         },
         onError: (_err, _variables, context) => {
            if (context?.previousContainer) {
               queryClient.setQueryData(["container", containerId], context.previousContainer);
            }
            if (context?.previousParcels) {
               queryClient.setQueryData(["container-parcels", containerId], context.previousParcels);
            }
            if (context?.previousReadyForContainer) {
               queryClient.setQueryData(["ready-for-container"], context.previousReadyForContainer);
            }
         },
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["container-parcels", containerId] });
            await queryClient.invalidateQueries({ queryKey: ["ready-for-container"] });
            await queryClient.invalidateQueries({ queryKey: ["containers"] });
            await queryClient.invalidateQueries({ queryKey: ["container", containerId] });
         },
      });
   },

   addParcelsByOrderId: (containerId: number) => {
      return useMutation({
         mutationFn: ({ orderId }: { orderId: number }) => api.containers.addParcelsByOrderId(containerId, orderId),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["container-parcels", containerId] });
            await queryClient.invalidateQueries({ queryKey: ["ready-for-container"] });
            await queryClient.invalidateQueries({ queryKey: ["containers"] });
            await queryClient.invalidateQueries({ queryKey: ["container", containerId] });
         },
      });
   },

   removeParcel: (containerId: number) => {
      return useMutation({
         mutationFn: ({ trackingNumber }: { trackingNumber: string }) =>
            api.containers.removeParcel(containerId, trackingNumber),
         onMutate: async ({ trackingNumber }) => {
            await queryClient.cancelQueries({ queryKey: ["container", containerId] });
            await queryClient.cancelQueries({ queryKey: ["container-parcels", containerId] });
            await queryClient.cancelQueries({ queryKey: ["ready-for-container"] });

            const previousContainer = queryClient.getQueryData(["container", containerId]);
            const previousParcels = queryClient.getQueryData(["container-parcels", containerId]);
            const previousReadyForContainer = queryClient.getQueryData(["ready-for-container"]);

            // Find the parcel being removed
            const parcelsData = previousParcels as any;
            const parcelToRemove = parcelsData?.pages
               ?.flatMap((page: any) => page?.rows ?? [])
               ?.find((p: any) => p.tracking_number === trackingNumber);

            // Optimistically update container parcel count
            queryClient.setQueryData(["container", containerId], (old: any) => {
               if (!old) return old;
               return {
                  ...old,
                  _count: {
                     ...old._count,
                     parcels: Math.max(0, (old._count?.parcels || 0) - 1),
                  },
               };
            });

            // Optimistically remove parcel from container parcels list
            queryClient.setQueryData(["container-parcels", containerId], (old: any) => {
               if (!old?.pages) return old;
               return {
                  ...old,
                  pages: old.pages.map((page: any, index: number) => {
                     const filteredRows =
                        page?.rows?.filter((pkg: any) => pkg.tracking_number !== trackingNumber) || [];
                     return {
                        ...page,
                        rows: filteredRows,
                        total: index === 0 ? Math.max(0, (page?.total || 0) - 1) : page?.total,
                     };
                  }),
               };
            });

            // Optimistically add back to ready-for-container list
            if (parcelToRemove) {
               queryClient.setQueryData(["ready-for-container"], (old: any) => {
                  if (!old?.pages) return old;
                  return {
                     ...old,
                     pages: old.pages.map((page: any, index: number) => {
                        if (index === 0) {
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

            return { previousContainer, previousParcels, previousReadyForContainer };
         },
         onError: (_err, _variables, context) => {
            if (context?.previousContainer) {
               queryClient.setQueryData(["container", containerId], context.previousContainer);
            }
            if (context?.previousParcels) {
               queryClient.setQueryData(["container-parcels", containerId], context.previousParcels);
            }
            if (context?.previousReadyForContainer) {
               queryClient.setQueryData(["ready-for-container"], context.previousReadyForContainer);
            }
         },
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["container-parcels", containerId] });
            await queryClient.invalidateQueries({ queryKey: ["ready-for-container"] });
            await queryClient.invalidateQueries({ queryKey: ["containers"] });
            await queryClient.invalidateQueries({ queryKey: ["container", containerId] });
         },
      });
   },

   getParcels: (containerId: number, limit: number = 20) => {
      return useInfiniteQuery({
         queryKey: ["container-parcels", containerId],
         queryFn: ({ pageParam = 0 }) => api.containers.getParcels(containerId, pageParam, limit),
         enabled: !!containerId,
         getNextPageParam: (lastPage, allPages) => {
            const currentPage = allPages.length;
            const totalRows = lastPage?.total ?? 0;
            const rowsInLastPage = lastPage?.rows?.length ?? 0;

            if (rowsInLastPage < limit) {
               return undefined;
            }

            const totalPages = Math.ceil(totalRows / limit);
            return currentPage < totalPages ? currentPage : undefined;
         },
         initialPageParam: 0,
      });
   },

   readyForContainer: (limit: number = 20) => {
      return useInfiniteQuery({
         queryKey: ["ready-for-container"],
         queryFn: ({ pageParam = 1 }) => api.containers.readyForContainer(pageParam, limit),
         getNextPageParam: (lastPage, allPages) => {
            const currentPage = allPages.length;
            const totalRows = lastPage?.total ?? 0;
            const rowsInLastPage = lastPage?.rows?.length ?? 0;

            if (rowsInLastPage < limit) {
               return undefined;
            }

            const totalPages = Math.ceil(totalRows / limit);
            return currentPage < totalPages ? currentPage + 1 : undefined;
         },
         initialPageParam: 1,
      });
   },
};
