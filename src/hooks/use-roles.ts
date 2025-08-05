import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export const useRoles = {
	get: () => {
		return useQuery({
			queryKey: ["roles"],
			queryFn: () => api.roles.get(),
		});
	},
};
