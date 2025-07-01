//user agencies hooks
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { queryClient } from "@/lib/query-client";
import type { Provider } from "@/data/types";

export const useProviders = {
	get: () => {
		return useQuery({ queryKey: ["get-providers"], queryFn: api.providers.get });
	},
	getById: (id: number) => {
		return useQuery({
			queryKey: ["get-provider-by-id", id],
			queryFn: () => api.providers.getById(id),
			enabled: !!id,
		});
	},
	create: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
		return useMutation({
			mutationFn: (data: Provider) => api.providers.create(data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-providers"] });
				options?.onSuccess?.();
			},
			onError: (error) => {
				options?.onError?.(error);
			},
		});
	},
};
