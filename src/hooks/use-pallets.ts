import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { queryClient } from "@/lib/query-client";

export const usePallets = {
   get: (page: number, limit: number) => {
      return useQuery({
         queryKey: ["pallets", page, limit],
         queryFn: () => api.pallets.get(page, limit),
         refetchOnWindowFocus: true,
         refetchOnMount: true,
      });
   },
   create: () => {
      return useMutation({
         mutationFn: () => api.pallets.create(),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["pallets"] });
            await queryClient.refetchQueries({ queryKey: ["pallets"] });
         },
      });
   },
   readyForPallet: (agency_id: number, limit: number = 20) => {
      return useInfiniteQuery({
         queryKey: ["ready-for-pallet", agency_id],
         queryFn: ({ pageParam = 1 }) => api.pallets.readyForPallet(pageParam, limit, agency_id),
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
   getParcelsByPalletId: (pallet_id: number, limit: number = 20) => {
      return useInfiniteQuery({
         queryKey: ["pallet-parcels", pallet_id],
         queryFn: ({ pageParam = 0 }) => api.pallets.getParcelsByPalletId(pallet_id, pageParam, limit),
         enabled: !!pallet_id,
         getNextPageParam: (lastPage, allPages) => {
            const currentPage = allPages.length;
            const totalRows = lastPage?.total ?? 0;
            const rowsInLastPage = lastPage?.rows?.length ?? 0;
            if (rowsInLastPage < limit) return undefined;
            const totalPages = Math.ceil(totalRows / limit);
            return currentPage < totalPages ? currentPage : undefined;
         },
         initialPageParam: 0,
      });
   },
   addParcel: (pallet_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ hbl }: { hbl: string }) => api.pallets.addParcel(pallet_id, hbl),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["ready-for-pallet", agency_id] });
            await queryClient.refetchQueries({ queryKey: ["ready-for-pallet", agency_id] });
            await queryClient.invalidateQueries({ queryKey: ["pallet-parcels", pallet_id] });
            await queryClient.refetchQueries({ queryKey: ["pallet-parcels", pallet_id] });
         },
      });
   },
   addParcelsByOrderId: (pallet_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ orderId }: { orderId: number }) => api.pallets.addParcelsByOrderId(pallet_id, orderId),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["ready-for-pallet", agency_id] });
            await queryClient.refetchQueries({ queryKey: ["ready-for-pallet", agency_id] });
            await queryClient.invalidateQueries({ queryKey: ["pallet-parcels", pallet_id] });
            await queryClient.refetchQueries({ queryKey: ["pallet-parcels", pallet_id] });
         },
      });
   },
   removeParcel: (pallet_id: number, agency_id: number) => {
      return useMutation({
         mutationFn: ({ tracking_number }: { tracking_number: string }) =>
            api.pallets.removeParcel(pallet_id, tracking_number),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["ready-for-pallet", agency_id] });
            await queryClient.refetchQueries({ queryKey: ["ready-for-pallet", agency_id] });
            await queryClient.invalidateQueries({ queryKey: ["pallet-parcels", pallet_id] });
            await queryClient.refetchQueries({ queryKey: ["pallet-parcels", pallet_id] });
         },
      });
   },
   deletePallet: () => {
      return useMutation({
         mutationFn: (pallet_id: number) => api.pallets.delete(pallet_id),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["pallets"] });
            await queryClient.refetchQueries({ queryKey: ["pallets"] });
         },
      });
   },
};
