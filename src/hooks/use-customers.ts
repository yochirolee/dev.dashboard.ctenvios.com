import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Customer } from "@/data/types";

export const useCustomers = {
	search: (query: string, page: number, limit: number) => {
		return useQuery({
			queryKey: ["customers", query, page, limit],
			queryFn: () => api.customer.search(query, page, limit),
		});
	},
	get: (page: number, limit: number) => {
		return useQuery({
			queryKey: ["customers", page, limit],
			queryFn: () => api.customer.get(page, limit),
			staleTime: 1000 * 60 * 5,
		});
	},
	create: (options?: {
		onSuccess?: (data: Customer) => void;
		onError?: (error: any) => void;
	}) => {
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
	update: (options?: {
		onSuccess?: (data: Customer) => void;
		onError?: (error: any) => void;
	}) => {
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

