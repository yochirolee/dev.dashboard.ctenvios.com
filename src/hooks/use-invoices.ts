import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import { authClient } from "@/lib/auth-client";
import type { Invoice } from "@/data/types";
import type { PaginationState } from "@tanstack/react-table";

export const useSearchInvoices = (searchQuery: string) => {
	return useQuery({
		queryKey: ["invoices", "search", searchQuery],
		queryFn: () => api.invoices.search(searchQuery, 1, 25),
	});
};

export const useGetInvoices = (pagination: PaginationState) => {
	const { data: session } = authClient.useSession();
	if (session?.user?.role == "ROOT") {
		return useQuery({
			queryKey: ["get-invoices", pagination],
			queryFn: () => api.invoices.get(pagination.pageIndex+1, pagination.pageSize),
		});
	}
	return useQuery({
		queryKey: ["get-invoices", session?.user?.agency_id],
		queryFn: () =>
			api.invoices.getByAgencyId(
				Number(session?.user?.agency_id),
				pagination.pageIndex + 1,
				pagination.pageSize,
			),
		placeholderData: keepPreviousData,
	});
};

export const useGetInvoiceById = (id: string) => {
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
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			options?.onError?.(error);
		},
	});
};
