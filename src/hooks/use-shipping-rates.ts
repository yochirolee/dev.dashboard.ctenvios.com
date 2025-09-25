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
			mutationFn: ({ data }: { data: ShippingRate }) => {
				console.log(data, "data on update");
				return api.shippingRates.update(data);
			},
			onSuccess: (data: ShippingRate) => {
				console.log(data, "data on update success");
				queryClient.invalidateQueries({
					queryKey: ["get-service-shipping-rates", data.agency_id, data.service_id],
				});
				toast.success("ShippingRate actualizada correctamente");
			},
			onError: (error) => {
				toast.error(error.message);
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
	getFixedRatesForAgencyAndService: (agency_id: number, service_id: number) => {
		return useQuery({
			queryKey: ["get-fixed_rates", agency_id, service_id],
			queryFn: () => api.shippingRates.getFixedRatesForAgencyAndService(agency_id, service_id),
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
