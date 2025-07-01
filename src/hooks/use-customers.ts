import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Customer } from "@/data/types";

export const useSearchCustomers = (query: string) => {
	return useQuery({
		queryKey: ["customers", query],
		queryFn: () => api.customer.search(query, 1, 50),
		staleTime: 1000 * 60 * 5,
	});
};

export const useCreateCustomer = (options?: {
	onSuccess?: (data: Customer) => void;
	onError?: (error: any) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Customer) => {
			return api.customer.create(data);
		},
		onSuccess: (data: Customer) => {
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			options?.onError?.(error);
		},
	});
};

export const useUpdateCustomer = (options?: {
	onSuccess?: (data: Customer) => void;
	onError?: (error: any) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: Customer }) => {
			console.log(id, data, "data in useUpdateCustomer");
			return api.customer.update(id, data);
		},
		onSuccess: (data: Customer) => {
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			options?.onError?.(error);
		},
	});
};
