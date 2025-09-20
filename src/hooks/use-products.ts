import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useProducts = {
	getRates: (agency_id: number, service_id: number) => {
		return useQuery({
			queryKey: ["get-products-rates", agency_id, service_id],
			queryFn: () => api.products.getRates(agency_id, service_id),
			enabled: !!agency_id && !!service_id,
			staleTime: 1000 * 60 * 5,
		});
	},
};
