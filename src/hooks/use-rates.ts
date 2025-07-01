import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { Rate } from "@/data/types";
import api from "@/api/api";

export const useRates = {
	update: () => {
		const queryClient = useQueryClient();
		return useMutation({
			mutationFn: ({ id, data }: { id: number; data: Rate }) => {
				return api.rates.update(id, data);
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-services"] });
			},
		});
	},
};
