import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Customs } from "@/data/types";
import { useDebounce } from "use-debounce";

export const useCustoms = {
	get: (page: number, limit: number) => {
		return useQuery({
			queryKey: ["customs-rates", page, limit],
			queryFn: () => api.customs.get(page, limit),
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
		});
	},

	search: (query: string, page: number, limit: number) => {
		const queryDebounced=useDebounce(query, 500);
		return useQuery({
			queryKey: ["customs-rates", queryDebounced	, page, limit],
			queryFn: () => api.customs.search(query, page, limit),
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
		});
	},

	create: () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: (data: Customs) => api.customs.create(data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["customs-rates"] });
			},
		});
	},
	update: () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: ({ id, data }: { id: number; data: Customs }) => api.customs.update(id, data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["customs-rates"] });
			},
		});
	},
	delete: () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: (id: number) => api.customs.delete(id),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["customs-rates"] });
			},
		});
	},
};
