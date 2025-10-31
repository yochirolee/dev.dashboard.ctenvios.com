import { useMutation } from "@tanstack/react-query";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import type { ShippingRate } from "@/data/types";
import api from "@/api/api";
import { toast } from "sonner";

export const useShippingRates = {
   create: (agency_id: number, options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: ShippingRate) => {
            return api.shippingRates.create(data);
         },
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-actives-services-rates", agency_id] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            toast.error(error.message);
            options?.onError?.(error);
         },
      });
   },
   getByServiceIdAndAgencyId: (service_id: number, agency_id: number) => {
      return useQuery({
         queryKey: ["get-shipping-rates-by-service-id-and-agency-id", service_id, agency_id],
         queryFn: () => api.shippingRates.getByServiceIdAndAgencyId(service_id, agency_id),
         enabled: !!service_id && !!agency_id,
      });
   },
};
