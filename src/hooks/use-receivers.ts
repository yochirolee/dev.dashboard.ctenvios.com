import api from "@/api/api";
import type { Receiver } from "@/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useReceivers = {
	search: (query: string, page: number | 0, limit: number | 50) => {
		return useQuery({
			queryKey: ["search-receivers", query, page, limit],
			queryFn: () => {
				return api.receivers.search(query, page, limit);
			},
			staleTime: 1000 * 60 * 5,
		});
	},
	get: (
		customerId: string | undefined,
		search: string | undefined,
		page: number | 0,
		limit: number | 50,
	) => {
		if (search && search.length > 2) {
			return useQuery({
				queryKey: ["search-receivers", search],
				queryFn: () => {
					return api.receivers.search(search, page, limit);
				},
			});
		}

		return useQuery({
			queryKey: [customerId],
			queryFn: () => {
				return api.customer.getReceivers(Number(customerId), page, limit);
			},
			enabled: !!customerId,
		});
	},
	create: (
		customerId?: number,
		options?: {
			onSuccess?: (data: Receiver) => void;
			onError?: (error: any) => void;
			customerId?: number;
			search?: string;
		},
	) => {
		const queryClient = useQueryClient();
		return useMutation({
				mutationFn: (data: Receiver) => {
				return api.receivers.create(data, customerId);
			},
			onSuccess: (data: Receiver) => {
				queryClient.invalidateQueries({
					queryKey: ["receivers", options?.customerId, options?.search],
				});
				options?.onSuccess?.(data);
			},
			onError: (error) => {
				options?.onError?.(error);
			},
		});
	},
	getByCI: (ci: string) => {
		return useQuery({
			queryKey: ["receivers", ci],
			queryFn: () => {
				return api.receivers.getByCI(ci);
			},
			enabled: ci.length === 11,
			retry: false,
		});
	},
};
