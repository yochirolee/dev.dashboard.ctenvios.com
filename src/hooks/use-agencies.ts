//user agencies hooks
import api from "@/api/api";
import { useMutation, useQuery } from "@tanstack/react-query";
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
   getUsers: (agency_id: number) => {
      return useQuery({
         queryKey: ["get-agency-users", agency_id],
         queryFn: () => api.agencies.getUsers(agency_id),
         enabled: !!agency_id,
      });
   },

   getServicesWithRates: (agency_id: number) => {
      return useQuery({
         queryKey: ["get-services-with-rates", agency_id],
         queryFn: () => api.agencies.servicesWithRates(agency_id),
         enabled: !!agency_id,
         staleTime: 1000 * 60 * 60 * 24,
      });
   },
   getActiveServicesWithRates: (agency_id: number) => {
      return useQuery({
         queryKey: ["get-active-services-with-rates", agency_id],
         queryFn: () => api.agencies.getActiveServicesWithRates(agency_id),
         enabled: !!agency_id,
         staleTime: 1000 * 60 * 60 * 24,
      });
   },
   getIntegrations: (agency_id: number) => {
      return useQuery({
         queryKey: ["agency-integrations", agency_id],
         queryFn: () => api.agencies.getIntegrations(agency_id),
         enabled: !!agency_id,
      });
   },
   createIntegration: (
      agency_id: number,
      options?: { onSuccess?: (data?: any) => void; onError?: (error: any) => void },
   ) => {
      return useMutation({
         mutationFn: (data: {
            name: string;
            email: string;
            contact_name: string;
            phone: string;
            agency_id: number;
            rate_limit: number;
            forwarder_id: number;
         }) => api.partners.createAdmin(data),
         onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["agency-integrations", agency_id] });
            options?.onSuccess?.(data);
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   createApiKey: (
      partnerId: number,
      options?: { onSuccess?: (data?: any) => void; onError?: (error: any) => void },
   ) => {
      return useMutation({
         mutationFn: (data?: { name?: string; environment?: string; expires_in_days?: number }) =>
            api.partners.createApiKey(partnerId, data),
         onSuccess: (data) => {
            options?.onSuccess?.(data);
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   getApiKeys: (partnerId: number) => {
      return useQuery({
         queryKey: ["partner-api-keys", partnerId],
         queryFn: () => api.partners.getApiKeys(partnerId),
         enabled: !!partnerId,
      });
   },
   uploadLogo: (
      agencyId: number,
      options?: { onSuccess?: (data?: any) => void; onError?: (error: any) => void },
   ) => {
      return useMutation({
         mutationFn: (file: File) => api.agencies.uploadLogo(agencyId, file),
         onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["get-agency", agencyId] });
            queryClient.invalidateQueries({ queryKey: ["get-agencies"] });
            options?.onSuccess?.(data);
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   deleteLogo: (
      agencyId: number,
      options?: { onSuccess?: () => void; onError?: (error: any) => void },
   ) => {
      return useMutation({
         mutationFn: () => api.agencies.deleteLogo(agencyId),
         onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-agency", agencyId] });
            queryClient.invalidateQueries({ queryKey: ["get-agencies"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
};
