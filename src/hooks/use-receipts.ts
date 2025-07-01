import api from "@/api/api";
import type { Receipt } from "@/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetReceipts = (customerId?: string, search?: string) => {
	if (search && search.length > 2) {
		return useQuery({
			queryKey: ["search-receipts", search],
			queryFn: () => {
				return api.receipts.search(search, 1, 50);
			},
		});
	}

	return useQuery({
		queryKey: [customerId],
		queryFn: () => {
			return api.customer.getReceipts(customerId as string);
		},
		enabled: !!customerId,
	});
};

export const useCreateReceipt = (
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
};

export const useSearchReceipts = (query: string, page: number | 1, limit: number | 50) => {
	return useQuery({
		queryKey: ["search-receipts", query],
		queryFn: () => {
			return api.receipts.search(query, page, limit);
		},
		staleTime: 1000 * 60 * 5,
	});
};
