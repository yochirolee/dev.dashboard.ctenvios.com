import { memo, useMemo } from "react";
import { type IssueComment } from "@/data/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lock, CheckCheck, FileText } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { useIssueCommentsByIssueId } from "@/collections/comments-collection";

interface CommentRowProps {
   id: number;
   content: string;
   createdAt: string;
   isCurrentUser: boolean;
   userName: string;
   showAvatar: boolean;
   showName: boolean;
   showDateSeparator: boolean;
   dateLabel: string;
   isInternal: boolean;
}

const CommentRow = memo(function CommentRow({
   id: _id,
   content,
   createdAt,
   isCurrentUser,
   userName,
   showAvatar,
   showName,
   showDateSeparator,
   dateLabel,
   isInternal,
}: CommentRowProps) {
   return (
      <div className="w-full">
         {showDateSeparator && (
            <div className="flex justify-center my-4">
               <span className="bg-muted/60 px-3 py-1 rounded-full text-xs text-muted-foreground shadow-sm">
                  {dateLabel}
               </span>
            </div>
         )}

         <div
            className={cn(
               "flex w-full min-w-0",
               isCurrentUser ? "justify-end" : "justify-start",
               isInternal && "opacity-80"
            )}
         >
            {!isCurrentUser && (
               <div className="w-8 shrink-0 flex justify-start mr-1.5">
                  {showAvatar ? (
                     <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                           {(userName || "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                     </Avatar>
                  ) : (
                     <div className="w-8" />
                  )}
               </div>
            )}

            <div
               className={cn(
                  "flex flex-col max-w-[75%] md:max-w-[65%] min-w-0 shrink-0",
                  isCurrentUser ? "items-end" : "items-start"
               )}
            >
               {showName && (
                  <span className="text-xs text-muted-foreground mb-0.5 ml-1 font-medium">{userName}</span>
               )}

               <div
                  className={cn(
                     "relative px-3 py-2 shadow-sm rounded-2xl",
                     isCurrentUser
                        ? "rounded-br-md bg-emerald-500 text-white dark:bg-emerald-600"
                        : "rounded-bl-md bg-muted/90 text-foreground dark:bg-muted",
                     isInternal && "border border-dashed border-amber-500/50"
                  )}
               >
                  {isInternal && (
                     <div className="flex items-center gap-1 mb-1">
                        <Lock className="w-3 h-3 opacity-70" />
                        <span className="text-xs opacity-70">Internal</span>
                     </div>
                  )}
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{content}</p>
               </div>

               <div
                  className={cn(
                     "flex items-center gap-1 mt-0.5",
                     isCurrentUser ? "flex-row-reverse" : "flex-row"
                  )}
               >
                  <span className="text-[11px] text-muted-foreground">
                     {createdAt ? format(new Date(createdAt), "HH:mm") : "N/A"}
                  </span>
                  {isCurrentUser && (
                     <CheckCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0" strokeWidth={2.5} />
                  )}
               </div>
            </div>

            {isCurrentUser && <div className="w-8 shrink-0" />}
         </div>
      </div>
   );
});

export function IssuesComments({ issueId }: { issueId: number }) {
   const { data: issueComments } = useIssueCommentsByIssueId(issueId);
   const user = useAppStore((state) => state.user);
   const session = useAppStore((state) => state.session);
   const currentUserId = useMemo(
      () => user?.id ?? (session as { user?: { id?: string } })?.user?.id ?? null,
      [user?.id, session]
   );

   const commentRows = useMemo(() => {
      if (!issueComments?.length) return [];
      return issueComments.map((comment: IssueComment & { user_id?: string }, index: number) => {
         const commentUserId = comment?.user?.id ?? comment?.user_id;
         const isCurrentUser =
            !!currentUserId && !!commentUserId && String(currentUserId) === String(commentUserId);
         const prevComment = index > 0 ? issueComments[index - 1] : null;
         const nextComment = index < issueComments.length - 1 ? issueComments[index + 1] : null;
         const prevUserId = prevComment?.user?.id ?? (prevComment as { user_id?: string })?.user_id;
         const nextUserId = nextComment?.user?.id ?? (nextComment as { user_id?: string })?.user_id;
         const prevSameSender = prevUserId === commentUserId;
         const nextSameSender = nextUserId === commentUserId;

         return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.created_at ?? "",
            isCurrentUser,
            userName: comment?.user?.name ?? "Unknown",
            showAvatar: !isCurrentUser && !nextSameSender,
            showName: !isCurrentUser && !prevSameSender && issueComments.length > 1,
            showDateSeparator:
               !prevComment ||
               format(new Date(comment?.created_at ?? ""), "dd/MM/yyyy") !==
                  format(new Date(prevComment?.created_at ?? ""), "dd/MM/yyyy"),
            dateLabel: comment.created_at ? format(new Date(comment.created_at), "dd MMMM yyyy") : "",
            isInternal: comment.is_internal ?? false,
         };
      });
   }, [issueComments, currentUserId]);

   return (
      <div className="space-y-0.5">
         {commentRows.map((row) => (
            <CommentRow key={row.id} {...row} />
         ))}
         {!issueComments?.length && (
            <div className="text-center py-16 text-muted-foreground">
               <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <FileText className="w-8 h-8 opacity-50" />
               </div>
               <p className="text-sm font-medium">No comments yet</p>
               <p className="text-xs mt-1">Start the conversation!</p>
            </div>
         )}
      </div>
   );
}
