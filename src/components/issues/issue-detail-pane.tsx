import { useIssues } from "@/hooks/use-issues";
import { CheckCircle2, Edit2, Paperclip, FileWarning, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { issueStatus, issuePriority, issueType } from "@/data/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { CogIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IssueOrderDetails } from "./issue-order-details";
import { Loader2 } from "lucide-react";
import { IssuesComments } from "./issues-comments";

interface IssueDetailPaneProps {
   issueId: number;
}

export function IssueDetailPane({ issueId }: IssueDetailPaneProps) {
   const [commentText, setCommentText] = useState("");
   const [isInternal, setIsInternal] = useState(false);
   const [editDialogOpen, setEditDialogOpen] = useState(false);
   const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
   const [resolutionNotes, setResolutionNotes] = useState("");
   const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
   const [commentToDelete, setCommentToDelete] = useState<{ id: number; issueId: number } | null>(null);

   const { data: issue, isLoading, error } = useIssues.getById(issueId);

   const addCommentMutation = useIssues.addComment({
      onSuccess: () => {
         toast.success("Comment added successfully");
         setCommentText("");
         setIsInternal(false);
      },
      onError: (error: any) => {
         toast.error(error?.response?.data?.message || "Failed to add comment");
      },
   });

   const updateIssueMutation = useIssues.update({
      onSuccess: () => {
         toast.success("Issue updated successfully");
         setEditDialogOpen(false);
      },
      onError: (error: any) => {
         toast.error(error?.response?.data?.message || "Failed to update issue");
      },
   });

   const resolveIssueMutation = useIssues.resolve({
      onSuccess: () => {
         toast.success("Issue resolved successfully");
         setResolveDialogOpen(false);
         setResolutionNotes("");
      },
      onError: (error: any) => {
         toast.error(error?.response?.data?.message || "Failed to resolve issue");
      },
   });

   const deleteCommentMutation = useIssues.deleteComment({
      onSuccess: () => {
         toast.success("Comment deleted successfully");
         setDeleteCommentDialogOpen(false);
         setCommentToDelete(null);
      },
      onError: (error: any) => {
         toast.error(error?.response?.data?.message || "Failed to delete comment");
      },
   });

   const handleAddComment = () => {
      if (!commentText.trim()) {
         toast.error("Comment cannot be empty");
         return;
      }
      addCommentMutation.mutate({
         id: issueId,
         data: { content: commentText, is_internal: isInternal },
      });
   };

   const handleUpdateIssue = (updates: any) => {
      updateIssueMutation.mutate({ id: issueId, data: updates });
   };

   const handleResolveIssue = () => {
      resolveIssueMutation.mutate({
         id: issueId,
         data: resolutionNotes ? { resolution_notes: resolutionNotes } : undefined,
      });
   };

   const handleDeleteComment = () => {
      if (commentToDelete) {
         deleteCommentMutation.mutate({
            id: commentToDelete.issueId,
            commentId: commentToDelete.id,
         });
      }
   };

   if (isLoading)
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <CogIcon size={40} className="animate-spin" />
               </EmptyMedia>
               <EmptyTitle>Loading Issue</EmptyTitle>
               <EmptyDescription>Please wait while we load the issue.</EmptyDescription>
            </EmptyHeader>
         </Empty>
      );

   if (error || !issue)
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <FileWarning />
               </EmptyMedia>
               <EmptyTitle>Issue Not Found</EmptyTitle>
               <EmptyDescription>The issue you are looking for does not exist.</EmptyDescription>
            </EmptyHeader>
         </Empty>
      );

   const creatorName = issue.created_by?.name || "Unknown";
   const creatorInitials = creatorName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

   return (
      <div className="flex flex-col h-full   bg-background overflow-hidden">
         {/* Header - Chat Style */}
         <div className="flex flex-col border-b shrink-0 bg-muted/30">
            <div className="flex items-center justify-between p-3">
               <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="w-8 h-8 shrink-0">
                     <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {creatorInitials}
                     </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                     <div className="font-semibold text-sm text-foreground">{creatorName}</div>
                     <div className="text-xs text-muted-foreground">
                        Issue #{issue.id} • <span className="text-green-500">{issue.status}</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setEditDialogOpen(true)}>
                     <Edit2 className="w-4 h-4" />
                  </Button>

                  {issue.status !== "RESOLVED" && issue.status !== "CLOSED" && (
                     <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setResolveDialogOpen(true)}>
                        <CheckCircle2 className="w-4 h-4" />
                     </Button>
                  )}
                 
               </div>
            </div>
            {/* Issue Metadata */}
            <div className="flex justify-between items-center gap-2 bg-muted/30 px-2 py-1.5 border-t border-border/50">
               <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                  <div className="col-span-2 flex items-center gap-1 min-w-0">
                     <span className="text-muted-foreground font-medium shrink-0">Title:</span>
                     <span className="text-foreground truncate">{issue.title}</span>
                  </div>
                  {issue.description && (
                     <div className="col-span-2 flex items-start gap-1 min-w-0">
                        <span className="text-muted-foreground font-medium shrink-0">Description:</span>
                        <p className="text-foreground line-clamp-2 leading-tight min-w-0 flex-1">{issue.description}</p>
                     </div>
                  )}
               </div>
               <div className="col-span-2 text-right text-xs mr-2 flex items-center gap-1">
                  <span className="text-muted-foreground font-medium shrink-0">Created:</span>
                  <span className="text-foreground">{format(new Date(issue.created_at), "dd/MM/yyyy hh:mm a")}</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 h-full  bg-background overflow-hidden">
            {/* Content Area */}
            <div className="flex-1 min-h-100 md:border-r border-b md:border-b-0 flex flex-col overflow-hidden">
               {/* Issue Description as First Message */}

               {/* Comments Section - Chat History (Scrollable) */}
               <div className="flex-1 min-h-0  overflow-y-auto p-4 bg-background">
                  <IssuesComments issueId={issueId} />
               </div>

               {/* Comment Input - Chat Style */}
               <div className="border-t  bg-background p-2.5 shrink-0">
                  <div className="flex items-center gap-2">
                     {/* Left Icons */}
                     <div className="flex items-center gap-0 shrink-0">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                           <Paperclip className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                           <Mic className="w-4 h-4 text-muted-foreground" />
                        </Button>
                     </div>

                     {/* Input Field */}
                     <div className="flex-1 relative">
                        <Textarea
                           value={commentText}
                           onChange={(e) => setCommentText(e.target.value)}
                           placeholder="Type a message..."
                           rows={1}
                           className="min-h-[4px] max-h-32 resize-none border-0 bg-muted/50 rounded-lg pr-20 text-sm py-3 focus-visible:ring-0"
                           onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                 e.preventDefault();
                                 handleAddComment();
                              }
                           }}
                        />
                        {/* Internal Toggle */}
                        <Button
                           variant="ghost"
                           size="icon"
                           className={cn(
                              "absolute bottom-2 right-2 h-7 w-7 rounded-full",
                              isInternal && "bg-muted text-foreground"
                           )}
                           onClick={() => setIsInternal(!isInternal)}
                           title="Toggle internal comment"
                        ></Button>
                     </div>

                     {/* Send Button */}
                     <Button
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || addCommentMutation.isPending}
                        className="h-9 px-6 shrink-0 bg-muted hover:bg-muted/80 rounded-lg text-foreground font-medium"
                     >
                        {addCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                     </Button>
                  </div>
               </div>
            </div>

            <IssueOrderDetails order_id={issue.order_id} affected_parcels={issue.affected_parcels || []} />
         </div>

         {/* Edit Dialog */}
         <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                     <span className="text-muted-foreground font-medium shrink-0">Parcel:</span>
                     <span className="text-foreground truncate">#{issue.parcel_id}</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                     <span className="text-muted-foreground font-medium shrink-0">Title:</span>
                     <span className="text-foreground truncate">{issue.title}</span>
                  </div>
               </div>
               <DialogHeader>
                  <DialogTitle>Edit Issue</DialogTitle>
                  <DialogDescription>Update issue details</DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-4">
                  <div>
                     <label className="text-sm font-medium">Status</label>
                     <Select value={issue.status} onValueChange={(value) => handleUpdateIssue({ status: value })}>
                        <SelectTrigger>
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           {Object.values(issueStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                 {status}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div>
                     <label className="text-sm font-medium">Priority</label>
                     <Select value={issue.priority} onValueChange={(value) => handleUpdateIssue({ priority: value })}>
                        <SelectTrigger>
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           {Object.keys(issuePriority).map((key) => (
                              <SelectItem key={key} value={key}>
                                 {issuePriority[key as keyof typeof issuePriority]}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
                  <div>
                     <label className="text-sm font-medium">Type</label>
                     <Select value={issue.type} onValueChange={(value) => handleUpdateIssue({ type: value })}>
                        <SelectTrigger>
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           {Object.keys(issueType).map((key) => (
                              <SelectItem key={key} value={key}>
                                 {issueType[key as keyof typeof issueType]}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                     Close
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Resolve Dialog */}
         <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Resolve Issue</DialogTitle>
                  <DialogDescription>Add resolution notes (optional)</DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-4">
                  <Textarea
                     value={resolutionNotes}
                     onChange={(e) => setResolutionNotes(e.target.value)}
                     placeholder="Resolution notes..."
                     rows={4}
                  />
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
                     Cancel
                  </Button>
                  <Button onClick={handleResolveIssue} disabled={resolveIssueMutation.isPending}>
                     Resolve Issue
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Delete Comment Dialog */}
         <AlertDialog open={deleteCommentDialogOpen} onOpenChange={setDeleteCommentDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                  <AlertDialogDescription>
                     Are you sure you want to delete this comment? This action cannot be undone.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={handleDeleteComment}
                     className="bg-destructive text-destructive-foreground"
                  >
                     Delete
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </div>
   );
}
