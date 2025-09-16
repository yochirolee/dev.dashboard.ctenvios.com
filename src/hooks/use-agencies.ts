//user agencies hooks
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { type Agency, agencySchema, userSchema } from "@/data/types";
import { queryClient } from "@/lib/query-client";
import { z } from "zod";
import { useAppStore } from "@/stores/app-store";

const createAgencyFormSchema = z.object({
	agency: agencySchema,
	user: userSchema,
});

export type CreateAgencyFormSchema = z.infer<typeof createAgencyFormSchema>;

export const useAgencies = {
	get: () => {
		return useQuery({ queryKey: ["get-agencies"], queryFn: api.agencies.get });
	},
	getServices: (id: number) => {
		return useQuery({
			queryKey: ["get-services", id],
			queryFn: () => api.agencies.getServices(id),
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
			enabled: !!id,
		});
	},

	create: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
		return useMutation({
			mutationFn: (data: CreateAgencyFormSchema) => api.agencies.create(data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-agencies"] });
				options?.onSuccess?.();
			},
			onError: (error) => {
				options?.onError?.(error);
			},
		});
	},
	update: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
		return useMutation({
			mutationFn: ({ id, data }: { id: number; data: Agency }) => api.agencies.update(id, data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["get-agencies"] });
				options?.onSuccess?.();
			},
			onError: (error) => {
				options?.onError?.(error);
			},
		});
	},
	getById: (id: number) => {
		return useQuery({
			queryKey: ["get-agency", id],
			queryFn: () => api.agencies.getById(id),
			enabled: !!id,
		});
	},
	getUsers: (id: number) => {
		return useQuery({
			queryKey: ["get-agency-users", id],
			queryFn: () => api.agencies.getUsers(id),
			enabled: !!id,
		});
	},
};
