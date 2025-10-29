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

   getActivesServicesRates: (agency_id: number) => {
      return useQuery({
         queryKey: ["get-actives-services-rates", agency_id],
         queryFn: () => api.agencies.getActivesServicesRates(agency_id),
         enabled: !!agency_id,
         
      });
   },
};
