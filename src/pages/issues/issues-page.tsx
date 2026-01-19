import { FilePlus2, Search, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIssues } from "@/hooks/use-issues";
import usePagination from "@/hooks/use-pagination";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { issueType } from "@/data/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { IssuesListPane } from "@/components/issues/issues-list-pane";
import { IssueDetailPane } from "@/components/issues/issue-detail-pane";
import { useIsMobile } from "@/hooks/use-mobile";

// Filter options for DataTableFacetedFilter
const statusOptions = [
   { value: "OPEN", label: "Abierto", color: "bg-blue-400" },
   { value: "IN_PROGRESS", label: "En Progreso", color: "bg-yellow-400" },
   { value: "RESOLVED", label: "Resuelto", color: "bg-green-400" },
   { value: "CLOSED", label: "Cerrado", color: "bg-gray-400" },
];

const priorityOptions = [
   { value: "LOW", label: "Bajo", color: "bg-gray-400" },
   { value: "MEDIUM", label: "Medio", color: "bg-blue-400" },
   { value: "HIGH", label: "Alto", color: "bg-orange-400" },
   { value: "URGENT", label: "Urgente", color: "bg-red-400" },
];

const typeOptions = Object.entries(issueType).map(([key, label]) => ({
   value: key,
   label: label,
}));

export default function IssuesPage() {
   const navigate = useNavigate();
   const { issueId } = useParams();
   const isMobile = useIsMobile();
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
   const [selectedPriority, setSelectedPriority] = useState<string | undefined>(undefined);
   const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
   const { pagination, setPagination } = usePagination();

   const filters = {
      status: selectedStatus,
      priority: selectedPriority,
      type: selectedType,
   };

   const { data, isLoading, isFetching } = useIssues.getAll(pagination.pageIndex, pagination.pageSize, filters);

   const handleClearFilters = () => {
      setSearchQuery("");
      setSelectedStatus(undefined);
      setSelectedPriority(undefined);
      setSelectedType(undefined);
      setPagination({ ...pagination, pageIndex: 0 });
   };

   const hasActiveFilters = !!searchQuery || !!selectedStatus || !!selectedPriority || !!selectedType;

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
                     <div className="flex items-center gap-2 p-4 border-b shrink-0 flex-wrap">
                        <DataTableFacetedFilter
                           title="Estado"
                           options={statusOptions}
                           selectedValue={selectedStatus}
                           onSelect={(value) => {
                              setSelectedStatus(value);
                              setPagination({ ...pagination, pageIndex: 0 });
                           }}
                        />

                        <DataTableFacetedFilter
                           title="Prioridad"
                           options={priorityOptions}
                           selectedValue={selectedPriority}
                           onSelect={(value) => {
                              setSelectedPriority(value);
                              setPagination({ ...pagination, pageIndex: 0 });
                           }}
                        />

                        <DataTableFacetedFilter
                           title="Tipo"
                           options={typeOptions}
                           selectedValue={selectedType}
                           onSelect={(value) => {
                              setSelectedType(value);
                              setPagination({ ...pagination, pageIndex: 0 });
                           }}
                        />

                        {hasActiveFilters && (
                           <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
                              Reset
                              <X className="ml-2 w-4 h-4" />
                           </Button>
                        )}
                     </div>

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
                        <Button onClick={() => navigate("/issues/new")} size="icon" className="h-6 w-6 ">
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
                     <div className="flex items-center gap-2 p-1 md:p-2 border-b shrink-0 overflow-x-auto">
                        <DataTableFacetedFilter
                           title="Estado"
                           options={statusOptions}
                           selectedValue={selectedStatus}
                           onSelect={(value) => {
                              setSelectedStatus(value);
                              setPagination({ ...pagination, pageIndex: 0 });
                           }}
                        />

                        <DataTableFacetedFilter
                           title="Prioridad"
                           options={priorityOptions}
                           selectedValue={selectedPriority}
                           onSelect={(value) => {
                              setSelectedPriority(value);
                              setPagination({ ...pagination, pageIndex: 0 });
                           }}
                        />

                        <DataTableFacetedFilter
                           title="Tipo"
                           options={typeOptions}
                           selectedValue={selectedType}
                           onSelect={(value) => {
                              setSelectedType(value);
                              setPagination({ ...pagination, pageIndex: 0 });
                           }}
                        />

                        {hasActiveFilters && (
                           <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
                              Reset
                              <X className="ml-2 w-4 h-4" />
                           </Button>
                        )}
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
