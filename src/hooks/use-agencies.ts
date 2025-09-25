//user agencies hooks
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { type Agency, agencySchema, userSchema } from "@/data/types";
import { queryClient } from "@/lib/query-client";
import { z } from "zod";

const createAgencyFormSchema = z.object({
	agency: agencySchema,
	user: userSchema,
});

export type CreateAgencyFormSchema = z.infer<typeof createAgencyFormSchema>;

export const useAgencies = {
	get: () => {
		return useQuery({ queryKey: ["get-agencies"], queryFn: api.agencies.get });
	},
	getServices: (agency_id: number, is_active?: boolean) => {
		return useQuery({
			queryKey: ["get-services", agency_id],
			queryFn: () => api.agencies.getServices(agency_id, is_active),
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
			enabled: !!agency_id,
		});
	},
	getServiceShippingRates: (
		agency_id: number,
		service_id: number,
		rate_type?: "WEIGHT" | "FIXED",
		is_active?: boolean,
	) => {
		return useQuery({
			queryKey: ["get-service-shipping-rates", agency_id, service_id, rate_type, is_active],
			queryFn: () =>
				api.agencies.getServiceShippingRates(agency_id, service_id, rate_type, is_active),
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
			enabled: !!agency_id && !!service_id,
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
