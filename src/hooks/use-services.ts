import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { queryClient } from "@/lib/query-client";
import type { Service } from "@/data/types";

export const useServices = {
	create: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
		return useMutation({
			mutationFn: (data: Service) => api.services.create(data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-provider-by-id"] });
				options?.onSuccess?.();
			},
			onError: (error) => {
				options?.onError?.(error);
			},
		});
	},
	get: () => {
		return useQuery({ queryKey: ["get-services"], queryFn: api.services.get });
	},
	getByAgencyId: (agencyId: number) => {
		return useQuery({
			queryKey: ["services", agencyId],
			queryFn: () => api.services.getByAgencyId(agencyId),
		});
	},
};
