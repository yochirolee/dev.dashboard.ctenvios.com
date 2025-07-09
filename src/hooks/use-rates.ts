import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { Rate } from "@/data/types";
import api from "@/api/api";

export const useRates = {
	create: () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: (data: Rate) => {
				return api.rates.create(data);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-services"] });
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
};
