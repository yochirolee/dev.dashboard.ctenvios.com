import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { Issue } from "@/data/types";
import { issuePriority, issueType } from "@/data/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Spinner } from "../ui/spinner";

interface LegacyIssuesListPaneProps {
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

// Tag color mapping for different badge types
const statusTagColors: Record<string, string> = {
   OPEN: "bg-blue-500/20 text-blue-400",
   IN_PROGRESS: "bg-yellow-500/20 text-yellow-400",
   RESOLVED: "bg-green-500/20 text-green-400",
   CLOSED: "bg-zinc-500/20 text-zinc-400",
};

const priorityTagColors: Record<string, string> = {
   URGENT: "bg-red-500/20 text-red-400",
   HIGH: "bg-orange-500/20 text-orange-400",
   MEDIUM: "bg-yellow-500/20 text-yellow-400",
   LOW: "bg-zinc-500/20 text-zinc-400",
};

export function LegacyIssuesListPane({
   issues,
   selectedIssueId,
   onIssueSelect,
   isLoading,
   pagination,
   onPaginationChange,
   total,
}: LegacyIssuesListPaneProps) {
   const totalPages = Math.ceil(total / pagination.pageSize);

   const handlePrevious = (): void => {
      if (pagination.pageIndex > 0) {
         onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex - 1 });
      }
   };

   const handleNext = (): void => {
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
                  const creatorName = issue.created_by?.name || "Unknown";
                  const previewText = issue.description || "No description provided";
                  const priorityValue = String(issue.priority).toUpperCase().trim();
                  const orderId = issue.legacy_order_id || issue.order_id;

                  return (
                     <button
                        key={issue.id}
                        onClick={() => onIssueSelect(issue.id)}
                        className={cn(
                           "w-full text-left px-4 py-3 transition-all border-b border-border/40",
                           "hover:bg-muted/50",
                           isSelected && "bg-muted/70"
                        )}
                     >
                        {/* Row 1: Creator name + timestamp */}
                        <div className="flex items-center justify-between mb-1">
                           <div className="flex items-center gap-2">
                              {/* Unresolved indicator dot */}
                              <span className="text-sm font-semibold text-foreground">{creatorName}</span>
                           </div>
                           <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(new Date(issue.created_at))}
                           </span>
                        </div>

                        {/* Row 2: Title/Subject */}
                        <div className="mb-1">
                           <h3 className="text-sm font-medium text-foreground/90 truncate">
                              {orderId && <span className="text-muted-foreground">#{orderId} · </span>}
                              {issue.title}
                           </h3>
                        </div>

                        {/* Row 3: Description preview */}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{previewText}</p>

                        {/* Row 4: Tags */}
                        <div className="flex items-center gap-2 flex-wrap">
                           {/* Status tag */}
                           <span
                              className={cn(
                                 "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                 statusTagColors[issue.status] || "bg-zinc-500/20 text-zinc-400"
                              )}
                           >
                              {issue.status === "IN_PROGRESS" ? "en progreso" : issue.status.toLowerCase()}
                           </span>

                           {/* Priority tag */}
                           <span
                              className={cn(
                                 "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                 priorityTagColors[priorityValue] || "bg-zinc-500/20 text-zinc-400"
                              )}
                           >
                              {issuePriority[issue.priority as keyof typeof issuePriority]?.toLowerCase() ||
                                 issue.priority}
                           </span>

                           {/* Type tag */}
                           <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/20 text-zinc-400">
                              {issueType[issue.type as keyof typeof issueType]?.toLowerCase() || issue.type}
                           </span>
                        </div>
                     </button>
                  );
               })}
            </ScrollArea>
         </div>

         {/* Pagination */}
         {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 shrink-0">
               <span className="text-xs text-muted-foreground">
                  Página {pagination.pageIndex + 1} de {totalPages}
               </span>
               <div className="flex items-center gap-2">
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={handlePrevious}
                     disabled={pagination.pageIndex === 0}
                     className="h-7 w-7 p-0"
                  >
                     <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={handleNext}
                     disabled={pagination.pageIndex >= totalPages - 1}
                     className="h-7 w-7 p-0"
                  >
                     <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </div>
         )}
      </div>
   );
}
