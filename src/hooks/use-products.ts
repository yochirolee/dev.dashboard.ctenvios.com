import api from "@/api/api";
import type { ProductRate, ShippingRate } from "@/data/types";
import { useQuery } from "@tanstack/react-query";

export const useProducts = {
	getRates: (agency_id: number, service_id: number) => {
		const { data, isLoading, isError } = useQuery({
			queryKey: ["get-products-rates", agency_id, service_id],
			queryFn: () => api.products.getRates(agency_id, service_id),
			enabled: !!agency_id && !!service_id,
			staleTime: 1000 * 60 * 5,
		});

		const flatData = data?.map((product: ProductRate & { shipping_rate: ShippingRate | null }) => {
			return {
				name: product?.name,
				rate_in_cents: product?.shipping_rate?.rate_in_cents,
				rate_id: product?.shipping_rate?.id,
				rate_type: product?.shipping_rate?.rate_type,
				product_id: product?.id || null,
				product_name: product?.name,
				min_weight: null,
				max_weight: null,
			};
		});

		return { data: flatData, isLoading, isError };
	},
};
