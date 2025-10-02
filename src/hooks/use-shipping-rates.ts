import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { ShippingRate } from "@/data/types";
import api from "@/api/api";
import { toast } from "sonner";

export const useShippingRates = {
   createBaseRate: (providerId: number, options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: ShippingRate) => {
            return api.shippingRates.createBaseRate(data);
         },
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-provider-by-id", providerId] });
            queryClient.invalidateQueries({ queryKey: ["get-services"] });
            toast.success("ShippingRate creada correctamente");
            options?.onSuccess?.();
         },
         onError: (error) => {
            toast.error(error.message);
            options?.onError?.(error);
         },
      });
   },
   updateBaseRate: (
      providerId: number | undefined,
      options?: { onSuccess?: () => void; onError?: (error: any) => void }
   ) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ data }: { data: ShippingRate }) => {
            return api.shippingRates.updateBaseRate(data);
         },
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-provider-by-id", providerId] });
            queryClient.invalidateQueries({ queryKey: ["get-services"] });
            toast.success("ShippingRate actualizada correctamente");
            options?.onSuccess?.();
         },
         onError: (error) => {
            toast.error(error.message);
            options?.onError?.(error);
         },
      });
   },
   update: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ data }: { data: ShippingRate }) => {
            console.log(data, "data on update");
            return api.shippingRates.update(data);
         },
         onSuccess: () => {
            queryClient.invalidateQueries({
               queryKey: ["get-services"],
            });
            toast.success("ShippingRate actualizada correctamente");
            options?.onSuccess?.();
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
   },

   delete: () => {
      const queryClient = useQueryClient();

      return useMutation({
         mutationFn: (id: number) => {
            return api.shippingRates.delete(id);
         },
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-services"] });
            queryClient.invalidateQueries({ queryKey: ["get-shipping-rates-by-agency-id"] });
            toast.success("Tarifa eliminada correctamente");
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
   },
};
