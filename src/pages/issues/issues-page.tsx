import { FilePlus2, Search, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIssues } from "@/hooks/use-issues";
import usePagination from "@/hooks/use-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { issueStatus, issuePriority, issueType } from "@/data/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { IssuesListPane } from "@/components/issues/issues-list-pane";
import { IssueDetailPane } from "@/components/issues/issue-detail-pane";
import { useIsMobile } from "@/hooks/use-mobile";

export default function IssuesPage() {
   const navigate = useNavigate();
   const { issueId } = useParams();
   const isMobile = useIsMobile();
   const [searchQuery, setSearchQuery] = useState("");
   const [filters, setFilters] = useState<{
      status?: string;
      priority?: string;
      type?: string;
   }>({});
   const { pagination, setPagination } = usePagination();

   const { data, isLoading, isFetching } = useIssues.getAll(pagination.pageIndex, pagination.pageSize, filters);

   const handleFilterChange = (newFilters: { status?: string; priority?: string; type?: string }) => {
      setFilters(newFilters);
      setPagination({ ...pagination, pageIndex: 0 });
   };

   const handleClearFilters = () => {
      setSearchQuery("");
      setFilters({});
      setPagination({ ...pagination, pageIndex: 0 });
   };

   const hasActiveFilters = Object.values(filters).some((value) => value !== undefined) || searchQuery;

   const handleIssueSelect = (id: number) => {
      navigate(`/issues/${id}`);
   };

   // On mobile, show only one pane at a time
   const showListOnMobile = !issueId || !isMobile;
   const showDetailOnMobile = issueId && isMobile;

   return (
      <div className="flex flex-col flex-1 max-h-[calc(100vh-50px)] overflow-hidden">
         {/* Mobile: Back button when viewing detail */}
         {showDetailOnMobile && (
            <div className="flex items-center gap-2 p-2 border-b shrink-0 md:hidden bg-background">
               <Button variant="ghost" size="icon" onClick={() => navigate("/issues")} className="h-9 w-9">
                  <ArrowLeft className="w-4 h-4" />
               </Button>
            </div>
         )}

         {/* Mobile: Show single pane */}
         {isMobile ? (
            <div className="flex-1 min-h-0 overflow-hidden">
               {showListOnMobile ? (
                  <div className="flex flex-col h-full border-r bg-background overflow-hidden">
                     {/* Header */}
                     <div className="flex items-center justify-between p-4 border-b shrink-0">
                        <h2 className="text-xl font-semibold">Issues</h2>
                        <Button
                           onClick={() => navigate("/issues/new")}
                           size="icon"
                           className="h-8 w-8 rounded-full"
                           variant="outline"
                        >
                           <FilePlus2 className="w-4 h-4" />
                        </Button>
                     </div>

                     {/* Search */}
                     <div className="p-4 border-b shrink-0">
                        <div className="flex items-center relative">
                           <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
                           <Input
                              type="search"
                              className="pl-9 bg-muted/50 border-0"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Issues search..."
                           />
                        </div>
                     </div>

                     {/* Filters */}
                     {hasActiveFilters && (
                        <div className="flex items-center gap-2 p-4 border-b shrink-0 flex-wrap">
                           <Select
                              value={filters?.status || "all"}
                              onValueChange={(value) => {
                                 handleFilterChange({ ...filters, status: value === "all" ? undefined : value });
                              }}
                           >
                              <SelectTrigger className="h-8 w-[120px] text-xs">
                                 <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">All Status</SelectItem>
                                 {Object.values(issueStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                       {status}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>

                           <Select
                              value={filters?.priority || "all"}
                              onValueChange={(value) => {
                                 handleFilterChange({ ...filters, priority: value === "all" ? undefined : value });
                              }}
                           >
                              <SelectTrigger className="h-8 w-[120px] text-xs">
                                 <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">All Priorities</SelectItem>
                                 {Object.values(issuePriority).map((priority) => (
                                    <SelectItem key={priority} value={priority}>
                                       {priority}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>

                           <Select
                              value={filters?.type || "all"}
                              onValueChange={(value) => {
                                 handleFilterChange({ ...filters, type: value === "all" ? undefined : value });
                              }}
                           >
                              <SelectTrigger className="h-8 w-[120px] text-xs">
                                 <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">All Types</SelectItem>
                                 {Object.values(issueType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                       {type}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>

                           <Button variant="ghost" onClick={handleClearFilters} size="sm" className="h-8">
                              <X className="w-4 h-4" />
                           </Button>
                        </div>
                     )}

                     {/* Issues List */}
                     <div className="flex-1 min-h-0">
                        <IssuesListPane
                           issues={data?.rows || []}
                           selectedIssueId={issueId ? Number(issueId) : undefined}
                           onIssueSelect={handleIssueSelect}
                           isLoading={isLoading || isFetching}
                           pagination={pagination}
                           onPaginationChange={setPagination}
                           total={data?.total || 0}
                        />
                     </div>
                  </div>
               ) : (
                  <div className="h-full overflow-hidden">
                     <IssueDetailPane issueId={Number(issueId)} />
                  </div>
               )}
            </div>
         ) : (
            /* Desktop: Split Pane Layout */
            <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 overflow-hidden">
               {/* Left Pane - Issues List */}
               <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
                  <div className="flex flex-col h-full  bg-background">
                     {/* Header */}
                     <div className="flex items-center justify-between h-12 p-2 border-b shrink-0">
                        <h2 className="text-xl font-semibold">Issues</h2>
                        <Button
                           onClick={() => navigate("/issues/new")}
                           size="icon"
                           className="h-6 w-6 "
                          
                        >
                           <FilePlus2 className="w-4 h-4" />
                        </Button>
                     </div>

                     {/* Search */}
                     <div className="p-2 border-b shrink-0">
                        <div className="flex items-center relative">
                           <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
                           <Input
                              type="search"
                              className="pl-9 bg-muted/50 border-0"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Issues search..."
                           />
                        </div>
                     </div>

                     {/* Filters */}

                     <div className="flex items-center gap-2 p-1 md:p-2 border-b shrink-0  overflow-x-auto">
                        <Select
                           value={filters?.status || "all"}
                           onValueChange={(value) => {
                              handleFilterChange({ ...filters, status: value === "all" ? undefined : value });
                           }}
                        >
                           <SelectTrigger className="h-6 w-[120px] text-xs">
                              <SelectValue placeholder="Status" className="text-xs" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              {Object.values(issueStatus).map((status) => (
                                 <SelectItem key={status} value={status}>
                                    {status}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>

                        <Select
                           value={filters?.priority || "all"}
                           onValueChange={(value) => {
                              handleFilterChange({ ...filters, priority: value === "all" ? undefined : value });
                           }}
                        >
                           <SelectTrigger className="h-8 w-[120px] text-xs">
                              <SelectValue placeholder="Priority" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">All Priorities</SelectItem>
                              {Object.values(issuePriority).map((priority) => (
                                 <SelectItem key={priority} value={priority}>
                                    {priority}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>

                        <Select
                           value={filters?.type || "all"}
                           onValueChange={(value) => {
                              handleFilterChange({ ...filters, type: value === "all" ? undefined : value });
                           }}
                        >
                           <SelectTrigger className="h-8 w-[120px] text-xs">
                              <SelectValue placeholder="Type" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              {Object.values(issueType).map((type) => (
                                 <SelectItem key={type} value={type}>
                                    {type}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>

                        <Button variant="ghost" onClick={handleClearFilters} size="sm" className="h-8">
                           <X className="w-4 h-4" />
                        </Button>
                     </div>
                     <IssuesListPane
                        issues={data?.rows || []}
                        selectedIssueId={issueId ? Number(issueId) : undefined}
                        onIssueSelect={handleIssueSelect}
                        isLoading={isLoading || isFetching}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        total={data?.total || 0}
                     />
                  </div>
               </ResizablePanel>

               <ResizableHandle withHandle />

               {/* Right Pane - Issue Detail */}
               <ResizablePanel defaultSize={80} minSize={80} maxSize={100}>
                  <div className="h-full overflow-hidden ">
                     {issueId ? (
                        <IssueDetailPane issueId={Number(issueId)} />
                     ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                           <div className="text-center">
                              <p className="text-lg font-medium">Select an issue</p>
                              <p className="text-sm mt-2">Choose an issue from the list to view details</p>
                           </div>
                        </div>
                     )}
                  </div>
               </ResizablePanel>
            </ResizablePanelGroup>
         )}
      </div>
   );
}
