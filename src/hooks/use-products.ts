import api from "@/api/api";
import type { Product } from "@/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProducts = {
   get: () => {
      return useQuery({ queryKey: ["get-products"], queryFn: api.products.get });
   },
   create: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: Product) => api.products.create(data),
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-products"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
};
