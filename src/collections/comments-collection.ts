import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { useLiveQuery, eq } from "@tanstack/react-db";
import { useAppStore } from "@/stores/app-store";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Type assertion needed due to @tanstack/db vs @tanstack/react-db version mismatch
export const issuesCollection = createCollection(
   electricCollectionOptions({
      id: "issues",
      getKey: (item: { id: number }) => item.id,
      shapeOptions: {
         url: `${apiBaseUrl}/electric/shape`,
         params: {
            table: `"Issue"`,
         },
         headers: {
            authorization: () => `Bearer ${useAppStore.getState().session?.token ?? ""}`,
         },
      },
   }) as unknown as Parameters<typeof createCollection>[0]
);

export const useIssues = () => {
   const { data: issues } = useLiveQuery((q) => q.from({ issue: issuesCollection }));
   return issues;
};

export const useIssueById = (issueId: number) => {
   return useLiveQuery(
      (q) =>
         q
            .from({ issue: issuesCollection })
            .where(({ issue }) => eq((issue as { id: number }).id, issueId))
            .findOne(),
      [issueId]
   );
};

// Type assertion needed due to @tanstack/db vs @tanstack/react-db version mismatch
export const usersCollection = createCollection(
   electricCollectionOptions({
      id: "users",
      getKey: (item: { id: string }) => item.id,
      shapeOptions: {
         url: `${apiBaseUrl}/electric/shape`,
         params: {
            table: `"user"`,
         },
         headers: {
            authorization: () => `Bearer ${useAppStore.getState().session?.token ?? ""}`,
         },
      },
   }) as unknown as Parameters<typeof createCollection>[0]
);

// Type assertion needed due to @tanstack/db vs @tanstack/react-db version mismatch
export const issueCommentsCollection = createCollection(
   electricCollectionOptions({
      id: "issue-comments",
      getKey: (item: { id: number }) => item.id,
      shapeOptions: {
         url: `${apiBaseUrl}/electric/shape`,
         params: {
            table: `"IssueComment"`,
         },
         headers: {
            authorization: () => `Bearer ${useAppStore.getState().session?.token ?? ""}`,
         },
      },
   }) as unknown as Parameters<typeof createCollection>[0]
);

export const useIssueComments = () => {
   const { data: comments } = useLiveQuery((q) => q.from({ comment: issueCommentsCollection }));
   return comments;
};

export const useIssueCommentsByIssueId = (issueId: number) => {
   return useLiveQuery(
      (q) =>
         q
            .from({ comment: issueCommentsCollection })
            .join({ user: usersCollection }, ({ comment, user }) =>
               eq((comment as { user_id: string }).user_id, (user as { id: string }).id)
            )
            .where(({ comment }) => eq((comment as { issue_id: number }).issue_id, issueId))
            .orderBy(({ comment }) => (comment as { created_at: string }).created_at, "asc")
            .select(({ comment, user }) => ({
               id: (comment as { id: number }).id,
               issue_id: (comment as { issue_id: number }).issue_id,
               user_id: (comment as { user_id: string }).user_id,
               content: (comment as { content: string }).content,
               is_internal: (comment as { is_internal: boolean }).is_internal,
               created_at: (comment as { created_at: string }).created_at,
               updated_at: (comment as { updated_at: string }).updated_at,
               user: {
                  id: (user as { id: string }).id,
                  name: (user as { name: string }).name,
                  email: (user as { email: string }).email,
               },
            })),
      [issueId]
   );
};
