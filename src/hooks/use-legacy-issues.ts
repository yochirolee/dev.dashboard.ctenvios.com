import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type {
   CreateLegacyIssueInput,
   UpdateIssueInput,
   AddCommentInput,
   AddAttachmentInput,
   Issue,
} from "@/data/types";

export const useLegacyIssues = {
   getAll: (
      page: number = 0,
      limit: number = 20,
      filters?: {
         status?: string;
         priority?: string;
         type?: string;
         order_id?: string;
         parcel_id?: string;
         assigned_to_id?: string;
      }
   ) => {
      return useQuery({
         queryKey: ["legacy-issues", "all", page, limit, filters],
         queryFn: () => api.legacyIssues.getAll(page, limit, filters),
         staleTime: 1000 * 60 * 5,
      });
   },
   getById: (id: number) => {
      return useQuery({
         queryKey: ["legacy-issues", id],
         queryFn: () => api.legacyIssues.getById(id),
         enabled: !!id,
      });
   },
   getComments: (id: number) => {
      return useQuery({
         queryKey: ["legacy-issues", id, "comments"],
         queryFn: () => api.legacyIssues.getComments(id),
         enabled: !!id,
         // Poll every 2 seconds when tab is visible for live-like updates
         refetchInterval: (query) => {
            // Only poll if tab is visible and query is not in error state
            if (document.visibilityState === "visible" && !query.state.error) {
               return 2000; // 2 seconds
            }
            return false; // Stop polling when tab is hidden
         },
         refetchOnWindowFocus: true,
         refetchOnMount: true,
         refetchOnReconnect: true,
         staleTime: 0, // Always consider data stale to ensure fresh updates
         gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
      });
   },
   getAttachments: (id: number) => {
      return useQuery({
         queryKey: ["legacy-issues", id, "attachments"],
         queryFn: () => api.legacyIssues.getAttachments(id),
         enabled: !!id,
      });
   },
   create: (options?: { onSuccess?: (data: Issue) => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: CreateLegacyIssueInput) => api.legacyIssues.create(data),
         onSuccess: (data: Issue) => {
            queryClient.invalidateQueries({ queryKey: ["legacy-issues"] });
            options?.onSuccess?.(data);
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   update: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ id, data }: { id: number; data: UpdateIssueInput }) => api.legacyIssues.update(id, data),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   resolve: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ id, data }: { id: number; data?: { resolution_notes?: string } }) =>
            api.legacyIssues.resolve(id, data),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   delete: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (id: number) => api.legacyIssues.delete(id),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   addComment: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ id, data }: { id: number; data: AddCommentInput }) => api.legacyIssues.addComment(id, data),
         onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues", variables.id] });
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues", variables.id, "comments"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   deleteComment: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ id, commentId }: { id: number; commentId: number }) =>
            api.legacyIssues.deleteComment(id, commentId),
         onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues", variables.id] });
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues", variables.id, "comments"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   addAttachment: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ id, data }: { id: number; data: AddAttachmentInput }) =>
            api.legacyIssues.addAttachment(id, data),
         onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues", variables.id] });
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues", variables.id, "attachments"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   deleteAttachment: (options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: ({ id, attachmentId }: { id: number; attachmentId: number }) =>
            api.legacyIssues.deleteAttachment(id, attachmentId),
         onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues", variables.id] });
            await queryClient.invalidateQueries({ queryKey: ["legacy-issues", variables.id, "attachments"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
   getParcelsByOrderId: (order_id: number) => {
      return useQuery({
         queryKey: ["legacy-issues", "parcels", order_id],
         queryFn: () => api.legacyIssues.getParcelsByOrderId(order_id),
         enabled: !!order_id,
      });
   },
};
