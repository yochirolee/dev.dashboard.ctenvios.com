import { FilePlus2, Search, X, ArrowLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePagination from "@/hooks/use-pagination";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { issueType, type Issue } from "@/data/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { LegacyIssuesListPane } from "@/components/legacy-issues/legacy-issues-list-pane";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLegacyIssues } from "@/hooks/use-legacy-issues";
import { LegacyIssueDetailPane } from "@/components/legacy-issues/legacy-issue-detail-pane";
import { useDebounce } from "use-debounce";

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

export default function LegacyIssuesPage() {
   const navigate = useNavigate();
   const { issueId } = useParams();
   const isMobile = useIsMobile();
   const [searchQuery, setSearchQuery] = useState("");
   const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
   const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
   const [selectedPriority, setSelectedPriority] = useState<string | undefined>(undefined);
   const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
   const { pagination, setPagination } = usePagination();

   // Determine if we're searching (to adjust page size and filtering strategy)
   const isSearching = useMemo(() => {
      const trimmedQuery = debouncedSearchQuery.trim();
      if (!trimmedQuery) return false;
      const numericValue = Number(trimmedQuery);
      return !isNaN(numericValue) && numericValue > 0;
   }, [debouncedSearchQuery]);

   // When searching, use larger page size and filter client-side
   // When not searching, use normal filters
   const combinedFilters = useMemo(() => {
      // Don't add order_id filter when searching - we'll filter client-side for both issue_id and legacy_order_id
      return {
         status: selectedStatus,
         priority: selectedPriority,
         type: selectedType,
      };
   }, [selectedStatus, selectedPriority, selectedType]);

   // Use larger page size when searching to get more results for client-side filtering
   const effectivePageSize = isSearching ? 100 : pagination.pageSize;

   const { data, isLoading, isFetching } = useLegacyIssues.getAll(
      pagination.pageIndex,
      effectivePageSize,
      combinedFilters
   );

   // Filter results client-side for issue_id matches when searching
   const filteredIssues = useMemo(() => {
      if (!data?.rows) return [];

      const trimmedQuery = debouncedSearchQuery.trim();
      if (!trimmedQuery) return data.rows;

      const numericValue = Number(trimmedQuery);
      if (!isNaN(numericValue) && numericValue > 0) {
         // Filter for issues where id matches OR legacy_order_id matches
         return data.rows.filter((issue: Issue) => issue.id === numericValue || issue.legacy_order_id === numericValue);
      }

      return data.rows;
   }, [data?.rows, debouncedSearchQuery]);

   const handleSearchChange = (value: string) => {
      setSearchQuery(value);
      setPagination({ ...pagination, pageIndex: 0 });
   };

   const handleClearFilters = () => {
      setSearchQuery("");
      setSelectedStatus(undefined);
      setSelectedPriority(undefined);
      setSelectedType(undefined);
      setPagination({ ...pagination, pageIndex: 0 });
   };

   const hasActiveFilters = !!searchQuery || !!selectedStatus || !!selectedPriority || !!selectedType;

   const handleIssueSelect = (id: number) => {
      navigate(`/legacy-issues/${id}`);
   };

   // On mobile, show only one pane at a time
   const showListOnMobile = !issueId || !isMobile;
   const showDetailOnMobile = issueId && isMobile;

   return (
      <div className="flex flex-col flex-1 max-h-[calc(100vh-50px)] overflow-hidden">
         {/* Mobile: Back button when viewing detail */}
         {showDetailOnMobile && (
            <div className="flex items-center gap-2 p-2 border-b shrink-0 md:hidden bg-background">
               <Button variant="ghost" size="icon" onClick={() => navigate("/legacy-issues")} className="h-9 w-9">
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
                           onClick={() => navigate("/legacy-issues/new")}
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
                              onChange={(e) => handleSearchChange(e.target.value)}
                              placeholder="Search by Issue ID or Order ID..."
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
                        <LegacyIssuesListPane
                           issues={filteredIssues}
                           selectedIssueId={issueId ? Number(issueId) : undefined}
                           onIssueSelect={handleIssueSelect}
                           isLoading={isLoading || isFetching}
                           pagination={pagination}
                           onPaginationChange={setPagination}
                           total={searchQuery.trim() ? filteredIssues.length : data?.total || 0}
                        />
                     </div>
                  </div>
               ) : (
                  <div className="h-full overflow-hidden">
                     <LegacyIssueDetailPane issueId={Number(issueId)} />
                  </div>
               )}
            </div>
         ) : (
            /* Desktop: Split Pane Layout */
            <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0 overflow-hidden">
               {/* Left Pane - Issues List */}
               <ResizablePanel defaultSize={28} minSize={28} maxSize={40}>
                  <div className="flex flex-col h-full  bg-background">
                     {/* Header */}
                     <div className="flex items-center justify-between h-12 p-2 border-b shrink-0">
                        <h2 className="text-xl font-semibold">Issues</h2>
                        <Button onClick={() => navigate("/legacy-issues/new")} size="icon" className="h-6 w-6 ">
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
                              onChange={(e) => handleSearchChange(e.target.value)}
                              placeholder="Search by Issue ID or Order ID..."
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
                     <LegacyIssuesListPane
                        issues={filteredIssues}
                        selectedIssueId={issueId ? Number(issueId) : undefined}
                        onIssueSelect={handleIssueSelect}
                        isLoading={isLoading || isFetching}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        total={searchQuery.trim() ? filteredIssues.length : data?.total || 0}
                     />
                  </div>
               </ResizablePanel>

               <ResizableHandle withHandle />

               {/* Right Pane - Issue Detail */}
               <ResizablePanel defaultSize={60} minSize={60}>
                  <div className="h-full overflow-hidden ">
                     {issueId ? (
                        <LegacyIssueDetailPane issueId={Number(issueId)} />
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
