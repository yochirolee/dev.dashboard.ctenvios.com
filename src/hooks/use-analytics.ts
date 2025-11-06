import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export const useAnalytics = {
	getSales: () => {
		return useQuery({
			queryKey: ["analytics", "sales"],
			queryFn: () => api.analytics.getSales(),
		});
	},
	getDailySalesByAgency: () => {
		return useQuery({
			queryKey: ["analytics", "daily-sales-by-agency"],
			queryFn: () => api.analytics.getDailySalesByAgency(),
		});
	},
};