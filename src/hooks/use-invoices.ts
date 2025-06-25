import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export const useSearchInvoices = (searchQuery: string) => {
	return useQuery({
		queryKey: ["invoices", "search", searchQuery],
		queryFn: () => api.invoices.search(searchQuery, 1, 25),
	});
};

export const useGetInvoiceById = (id: string) => {
	return useQuery({
		queryKey: ["invoice", id],
		queryFn: () => api.invoices.getById(Number(id)),
		enabled: !!id,
	});
};
