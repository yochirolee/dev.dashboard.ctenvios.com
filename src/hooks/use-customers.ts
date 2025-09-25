import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Customer } from "@/data/types";
import { useDebounce } from "use-debounce";

export const useCustomers = {
	search: (query: string, page: number, limit: number) => {
		const [queryDebounced] = useDebounce(query, 500);
		return useQuery({
			queryKey: ["customers", queryDebounced, page, limit],
			queryFn: () => api.customer.search(queryDebounced, page, limit),
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
		});
	},
	get: (page: number, limit: number) => {
		return useQuery({
			queryKey: ["customers", page, limit],
			queryFn: () => api.customer.get(page, limit),
			staleTime: 1000 * 60 * 5,
		});
	},
	create: (options?: { onSuccess?: (data: Customer) => void; onError?: (error: any) => void }) => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: (data: Customer) => api.customer.create(data),
			onSuccess: (data: Customer) => {
				options?.onSuccess?.(data);
				queryClient.invalidateQueries({ queryKey: ["customers"] });
			},
			onError: (error: any) => {
				options?.onError?.(error);
			},
		});
	},
	update: (options?: { onSuccess?: (data: Customer) => void; onError?: (error: any) => void }) => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: ({ id, data }: { id: number; data: Customer }) => api.customer.update(id, data),
			onSuccess: (data: Customer) => {
				queryClient.invalidateQueries({ queryKey: ["customers"] });
				options?.onSuccess?.(data);
			},
			onError: (error: any) => {
				options?.onError?.(error);
			},
		});
	},
};
