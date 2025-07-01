import { useMutation } from "@tanstack/react-query";
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
};
