import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Customs } from "@/data/types";

export const useCustoms = {
	get: () => {
		return useQuery({
			queryKey: ["customs"],
			queryFn: api.customs.get,
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
		});
	},
	create: () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: (data: Customs) => api.customs.create(data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["customs"] });
			},
		});
	},
	update: () => {
		return useMutation({
			mutationFn: ({ id, data }: { id: number; data: Customs }) => api.customs.update(id, data),
		});
	},
	delete: () => {
		return useMutation({
			mutationFn: (id: number) => api.customs.delete(id),
		});
	},
};
