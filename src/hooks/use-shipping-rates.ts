import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { ShippingRate } from "@/data/types";
import api from "@/api/api";

export const useShippingRates = {
   create: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: ShippingRate) => {
            return api.shippingRates.create(data);
         },
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-services-with-rates"] });
            options?.onSuccess?.();
         },
      });
   },
   update: (rate_id: number, options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: ShippingRate) => {
            return api.shippingRates.update(rate_id, data);
         },
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-services-with-rates"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   
};
