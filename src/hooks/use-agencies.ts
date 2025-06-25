//user agencies hooks
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
export const useAgencies = {
	get: () => {
		return useQuery({ queryKey: ["get-agencies-names"], queryFn: api.agencies.get });
	},
	getServices: (id: number) => {
		return useQuery({
			queryKey: ["get-services", id],
			queryFn: () => api.agencies.getServices(id),
		});
	},
};
