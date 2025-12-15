import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { CreateIssueInput, UpdateIssueInput, AddCommentInput, AddAttachmentInput, Issue } from "@/data/types";

export const useIssues = {
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
         queryKey: ["issues", "all", page, limit, filters],
         queryFn: () => api.issues.getAll(page, limit, filters),
         staleTime: 1000 * 60 * 5,
      });
   },
   getById: (id: number) => {
      return useQuery({
         queryKey: ["issues", id],
         queryFn: () => api.issues.getById(id),
         enabled: !!id,
      });
   },
   getComments: (id: number) => {
      return useQuery({
         queryKey: ["issues", id, "comments"],
         queryFn: () => api.issues.getComments(id),
         enabled: !!id,
      });
   },
   getAttachments: (id: number) => {
      return useQuery({
         queryKey: ["issues", id, "attachments"],
         queryFn: () => api.issues.getAttachments(id),
         enabled: !!id,
      });
   },
   create: (options?: { onSuccess?: (data: Issue) => void; onError?: (error: any) => void }) => {
      const queryClient = useQueryClient();
      return useMutation({
         mutationFn: (data: CreateIssueInput) => api.issues.create(data),
         onSuccess: (data: Issue) => {
            queryClient.invalidateQueries({ queryKey: ["issues"] });
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
         mutationFn: ({ id, data }: { id: number; data: UpdateIssueInput }) => api.issues.update(id, data),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["issues"] });
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
            api.issues.resolve(id, data),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["issues"] });
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
         mutationFn: (id: number) => api.issues.delete(id),
         onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["issues"] });
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
         mutationFn: ({ id, data }: { id: number; data: AddCommentInput }) => api.issues.addComment(id, data),
         onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["issues", variables.id] });
            await queryClient.invalidateQueries({ queryKey: ["issues", variables.id, "comments"] });
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
         mutationFn: ({ id, commentId }: { id: number; commentId: number }) => api.issues.deleteComment(id, commentId),
         onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["issues", variables.id] });
            await queryClient.invalidateQueries({ queryKey: ["issues", variables.id, "comments"] });
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
         mutationFn: ({ id, data }: { id: number; data: AddAttachmentInput }) => api.issues.addAttachment(id, data),
         onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["issues", variables.id] });
            await queryClient.invalidateQueries({ queryKey: ["issues", variables.id, "attachments"] });
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
            api.issues.deleteAttachment(id, attachmentId),
         onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({ queryKey: ["issues", variables.id] });
            await queryClient.invalidateQueries({ queryKey: ["issues", variables.id, "attachments"] });
            options?.onSuccess?.();
         },
         onError: (error) => {
            options?.onError?.(error);
         },
      });
   },
};
