import api from "@/api/api";
import { queryClient } from "@/lib/query-client";

export const usePrefetch = {
	

	

	
	customsRates: async (page: number, limit: number): Promise<void> => {
		return await queryClient.prefetchQuery({
			queryKey: ["customs-rates", page, limit],
			queryFn: () => api.customs.get(page, limit),
			staleTime: 1000 * 60 * 5,
		});
	},

	invoices: async (page: number, limit: number, searchQuery: string, startDate: string, endDate: string): Promise<void> => {
		return await queryClient.prefetchQuery({
			queryKey: ["get-invoices", "search", searchQuery, page, limit, startDate, endDate],
			queryFn: () => api.invoices.search(searchQuery, page, limit, startDate, endDate),
			staleTime: 1000 * 60 * 5,
		});
	},
};
