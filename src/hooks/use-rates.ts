import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { Rate } from "@/data/types";
import api from "@/api/api";
import { toast } from "sonner";

export const useRates = {
	create: () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: (data: Rate) => {
				return api.rates.create(data);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-services"] });
				toast.success("Tarifa creada correctamente");
			},
		});
	},
	update: () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: ({ id, data }: { id: number; data: Rate }) => {
				console.log(data, "Rates data in Hook");
				return api.rates.update(id, data);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-services"] });
				toast.success("Tarifa actualizada correctamente");
			},
		});
	},
	getByAgencyId: (agency_id: number) => {
		return useQuery({
			queryKey: ["get-rates-by-agency-id", agency_id],
			queryFn: () => api.rates.getByAgencyId(agency_id),
			enabled: !!agency_id,
		});
	},
	delete: () => {
		const queryClient = useQueryClient();

		return useMutation({
			mutationFn: (id: number) => {
				return api.rates.delete(id);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-services"] });
				queryClient.invalidateQueries({ queryKey: ["get-rates-by-agency-id"] });
				toast.success("Tarifa eliminada correctamente");
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});
	},
};
