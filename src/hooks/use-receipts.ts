import api from "@/api/api";
import type { Receipt } from "@/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useReceipts = {
	search: (query: string, page: number | 0, limit: number | 50) => {
		return useQuery({
			queryKey: ["search-receipts", query, page, limit],
			queryFn: () => {
				return api.receipts.search(query, page, limit);
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
				queryKey: ["search-receipts", search],
				queryFn: () => {
					return api.receipts.search(search, page, limit);
				},
				
			});
		}

		return useQuery({
			queryKey: [customerId],
			queryFn: () => {
				return api.customer.getReceipts(Number(customerId), page, limit);
			},
			enabled: !!customerId,
		});
	},
	create: (
		customerId?: number,
		options?: {
			onSuccess?: (data: Receipt) => void;
			onError?: (error: any) => void;
			customerId?: number;
			search?: string;
		},
	) => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: (data: Receipt) => {
				return api.receipts.create(data, customerId);
			},
			onSuccess: (data: Receipt) => {
				queryClient.invalidateQueries({
					queryKey: ["receipts", options?.customerId, options?.search],
				});
				options?.onSuccess?.(data);
			},
			onError: (error) => {
				options?.onError?.(error);
			},
		});
	},
};
