import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative-time";
import {  Paperclip, UserCheck, Package } from "lucide-react";
import type { Issue } from "@/data/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Link } from "react-router-dom";
import { Spinner } from "../ui/spinner";

interface IssuesListPaneProps {
   issues: Issue[];
   selectedIssueId?: number;
   onIssueSelect: (id: number) => void;
   isLoading: boolean;
   pagination: {
      pageIndex: number;
      pageSize: number;
   };
   onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
   total: number;
}

export function IssuesListPane({
   issues,
   selectedIssueId,
   onIssueSelect,
   isLoading,
   pagination,
   onPaginationChange,
   total,
}: IssuesListPaneProps) {
   const totalPages = Math.ceil(total / pagination.pageSize);

   const handlePrevious = () => {
      if (pagination.pageIndex > 0) {
         onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex - 1 });
      }
   };

   const handleNext = () => {
      if (pagination.pageIndex < totalPages - 1) {
         onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex + 1 });
      }
   };

   if (isLoading) {
      return (
         <div className="flex items-center justify-center h-full">
            <Spinner className="w-4 h-4" />
         </div>
      );
   }

   return (
      <div className="flex flex-col h-full overflow-hidden">
         {/* Issues List - Scrollable */}
         <div className="flex-1 min-h-0 overflow-y-auto">
            <ScrollArea>
               {issues.map((issue) => {
                  const isSelected = selectedIssueId === issue.id;
                  const attachmentCount = issue._count?.attachments || 0;

                  const creatorName = issue.created_by?.name || "Unknown";
                  const creatorInitials = creatorName
                     .split(" ")
                     .map((n) => n[0])
                     .join("")
                     .toUpperCase()
                     .slice(0, 2);

                  const assignedToName = issue.assigned_to?.name;

                  const status = issue.status;
                  const statusColor =
                     status === "OPEN"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : status === "IN_PROGRESS"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : status === "RESOLVED"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-blue-500/10 text-blue-500 border-blue-500/20";

                  const priorityColor =
                     issue.priority === "URGENT"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : issue.priority === "HIGH"
                        ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                        : issue.priority === "MEDIUM"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-muted text-muted-foreground border-border";

                  const previewText = issue.description || "No description";
                  const orderId = issue.order_id;

                  return (
                     <button
                        key={issue.id}
                        onClick={() => onIssueSelect(issue.id)}
                        className={cn(
                           "w-full text-left p-4 hover:bg-muted/30 transition-colors border-b border-border/30 relative group",
                           isSelected && "bg-muted/50 border-l-4 border-l-primary"
                        )}
                     >
                        <div className="flex items-start gap-3">
                           {/* Avatar */}
                           <Avatar className="w-8 h-8 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                 {creatorInitials}
                              </AvatarFallback>
                           </Avatar>

                           {/* Main Content */}
                           <div className="flex-1 min-w-0 space-y-2">
                              {/* Header: Title and Status */}
                              <div className="flex items-start justify-between gap-2">
                                 <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground font-medium">{creatorName}</span>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                       <span className="text-xs font-mono text-muted-foreground shrink-0">
                                          #{issue.id}
                                       </span>
                                       <h3 className="font-semibold text-sm text-foreground line-clamp-1 flex-1">
                                          {issue.title}
                                       </h3>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant="outline" className={cn("text-[10px] font-medium", priorityColor)}>
                                       {issue.priority}
                                    </Badge>
                                    <Badge
                                       variant="outline"
                                       className={cn("text-[10px] font-medium shrink-0", statusColor)}
                                    >
                                       {status.replace("_", " ")}
                                    </Badge>
                                 </div>
                              </div>

                              {/* Description Preview */}
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                 {previewText}
                              </p>

                              {/* Metadata Row: Priority, Type, and Related Items */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                 <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] font-medium">
                                       {issue.type}
                                    </Badge>
                                    {orderId && (
                                       <Link
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                          target="_blank"
                                          to={`/orders/${orderId}`}
                                          onClick={(e) => e.stopPropagation()}
                                       >
                                          <Package className="w-3 h-3" />
                                          Order #{orderId}
                                       </Link>
                                    )}{" "}
                                 </div>
                                 <span className="text-xs text-muted-foreground shrink-0 ">
                                    {formatRelativeTime(new Date(issue.created_at))}
                                 </span>
                              </div>

                              {/* Footer: Creator, Assignment, Activity, and Actions */}
                              <div className="flex justify-end">
                                 <div className="flex items-center justify-end gap-3">
                                    {/* Assigned To */}
                                    {assignedToName && (
                                       <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                          <UserCheck className="w-3.5 h-3.5" />
                                          <span className="font-medium">{assignedToName}</span>
                                       </div>
                                    )}

                                    {/* Attachment Count */}
                                    {attachmentCount > 0 && (
                                       <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Paperclip className="w-3.5 h-3.5" />
                                          <span>{attachmentCount}</span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </button>
                  );
               })}
            </ScrollArea>
         </div>

         {/* Pagination */}
         {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t shrink-0">
               <div className="text-xs text-muted-foreground">
                  Page {pagination.pageIndex + 1} of {totalPages}
               </div>
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevious} disabled={pagination.pageIndex === 0}>
                     <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={handleNext}
                     disabled={pagination.pageIndex >= totalPages - 1}
                  >
                     <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </div>
         )}
      </div>
   );
}
