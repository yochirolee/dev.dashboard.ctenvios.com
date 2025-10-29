import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { ShippingRate } from "@/data/types";
import api from "@/api/api";
import { toast } from "sonner";

export const useShippingRates = {
   create: ( options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: ShippingRate) => {
            return api.shippingRates.create(data);
         },
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-shipping-rates"] });
            toast.success("ShippingRate creada correctamente");
            options?.onSuccess?.();
         },
         onError: (error) => {
            toast.error(error.message);
            options?.onError?.(error);
         },
      });
   },
 
};
