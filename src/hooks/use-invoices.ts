import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Invoice } from "@/data/types";
import { useAppStore } from "@/stores/app-store";

export const useSearchInvoices = (searchQuery: string, page: number, limit: number) => {
	if (searchQuery.length > 2) {
		return useQuery({
			queryKey: ["get-invoices", "search", searchQuery, page, limit],
			queryFn: () => api.invoices.search(searchQuery, page, limit),
			staleTime: 1000 * 60 * 5,
			initialData: keepPreviousData,
			enabled: searchQuery.length > 2,
		});
	}
	return useGetInvoices(page, limit);
};

export const useGetInvoices = (page: number, limit: number) => {
	const { session } = useAppStore();
	const user = session?.user;
	if (user?.role == "ROOT") {
		return useQuery({
			queryKey: ["get-invoices", page, limit],
			queryFn: () => api.invoices.get(page, limit),
			placeholderData: keepPreviousData,
		});
	}
	return useQuery({
		queryKey: ["get-invoices", user?.agency_id, page, limit],
		queryFn: () => api.invoices.getByAgencyId(Number(user?.agency_id), page, limit),
		placeholderData: keepPreviousData,
	});
};

export const useGetInvoiceById = (id: number) => {
	return useQuery({
		queryKey: ["invoice", id],
		queryFn: () => api.invoices.getById(Number(id)),
		enabled: !!id,
	});
};

export const useCreateInvoice = (options?: {
	onSuccess?: (data: Invoice) => void;
	onError?: (error: any) => void;
}) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: Invoice) => api.invoices.create(data),
		onSuccess: (data: Invoice) => {
			queryClient.invalidateQueries({ queryKey: ["get-invoices"] });
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			options?.onError?.(error);
		},
	});
};
