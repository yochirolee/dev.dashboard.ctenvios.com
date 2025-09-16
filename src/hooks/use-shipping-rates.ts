import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { ShippingRate } from "@/data/types";
import api from "@/api/api";
import { toast } from "sonner";

export const useShippingRates = {
	create: () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: (data: ShippingRate) => {
				return api.shippingRates.create(data);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-services"] });
				toast.success("ShippingRate creada correctamente");
			},
		});
	},
	update: () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: ({ id, data }: { id: number; data: ShippingRate }) => {
				console.log(data, "ShippingRates data in Hook");
				return api.shippingRates.update(id, data);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-agency-by-id"] });
				toast.success("ShippingRate actualizada correctamente");
			},
		});
	},
	getBaseRate: (agency_id: number, service_id: number) => {
		return useQuery({
			queryKey: ["base-rate", agency_id, service_id],
			queryFn: () => api.shippingRates.getBaseRate(agency_id, service_id),
			enabled: !!agency_id && !!service_id,
		});
	},
	getByAgencyIdAndServiceId: (agency_id: number, service_id: number) => {
		return useQuery({
			queryKey: ["get-shipping-rates-by-agency-id-and-service-id", agency_id, service_id],
			queryFn: () => api.shippingRates.getByAgencyIdAndServiceId(agency_id, service_id),
			enabled: !!agency_id && !!service_id,
		});
	},
	getByAgencyId: (agency_id: number) => {
		return useQuery({
			queryKey: ["get-shipping-rates-by-agency-id", agency_id],
			queryFn: () => api.shippingRates.getByAgencyId(agency_id),
			enabled: !!agency_id,
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
