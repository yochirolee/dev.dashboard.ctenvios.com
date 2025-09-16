import api from "@/api/api";
import { queryClient } from "@/lib/query-client";

export const usePrefetch = {
	services: async (agency_id: number): Promise<void> => {
		
		return await queryClient.prefetchQuery({
			queryKey: ["services", agency_id],
			queryFn: () => api.services.getByAgencyId(agency_id),
			staleTime: 1000 * 60 * 5,
		});
	},

	products: async (agency_id: number, service_id: number): Promise<void> => {
		return await queryClient.prefetchQuery({
			queryKey: ["products", agency_id, service_id],
			queryFn: () => api.products.getRates(agency_id, service_id),
			staleTime: 1000 * 60 * 5,
		});
	},

	baseRate: async (agency_id: number, service_id: number): Promise<void> => {
		console.log("prefetching base rate", agency_id, service_id);
		return await queryClient.prefetchQuery({
			queryKey: ["base-rate", agency_id, service_id],
			queryFn: () => api.shippingRates.getBaseRate(agency_id, service_id),
			staleTime: 1000 * 60 * 5,
		});
	},
	customsRates: async (page: number, limit: number): Promise<void> => {
		return await queryClient.prefetchQuery({
			queryKey: ["customs-rates", page, limit],
			queryFn: () => api.customs.get(page, limit),
			staleTime: 1000 * 60 * 5,
		});
	},

	invoices: async (agency_id: number, page: number, limit: number): Promise<void> => {
		return await queryClient.prefetchQuery({
			queryKey: ["invoices", agency_id, page, limit],
			queryFn: () => api.invoices.getByAgencyId(agency_id, page, limit),
			staleTime: 1000 * 60 * 5,
		});
	},
};
