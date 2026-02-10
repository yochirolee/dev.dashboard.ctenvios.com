import { useState } from "react";
import { Search, X } from "lucide-react";
import { DataTableCustom } from "@/components/ui/data-table-custom";
import { parcelColumns, type Parcel } from "@/components/parcels/parcels-columns";
import { useParcels } from "@/hooks/use-parcels";
import usePagination from "@/hooks/use-pagination";
import { Button } from "@/components/ui/button";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { Input } from "@/components/ui/input";
import { STATUS_CONFIG } from "@/lib/parcel-status";
import type { ParcelStatus } from "@/data/types";
import { useDebounce } from "use-debounce";

/** Tailwind text-* color name to hex so dropdown dots always show (avoids JIT purging dynamic bg-* classes). */
const STATUS_COLOR_HEX: Record<string, string> = {
   "text-blue-500": "#3b82f6",
   "text-blue-400": "#60a5fa",
   "text-indigo-500": "#6366f1",
   "text-indigo-400": "#818cf8",
   "text-violet-500": "#8b5cf6",
   "text-violet-400": "#a78bfa",
   "text-purple-500": "#a855f7",
   "text-purple-400": "#c084fc",
   "text-fuchsia-500": "#d946ef",
   "text-cyan-500": "#06b6d4",
   "text-cyan-400": "#22d3ee",
   "text-teal-500": "#14b8a6",
   "text-teal-400": "#2dd4bf",
   "text-orange-500": "#f97316",
   "text-orange-400": "#fb923c",
   "text-amber-500": "#f59e0b",
   "text-amber-400": "#fbbf24",
   "text-lime-500": "#84cc16",
   "text-lime-400": "#a3e635",
   "text-red-500": "#ef4444",
   "text-red-400": "#f87171",
   "text-green-500": "#22c55e",
   "text-green-400": "#4ade80",
   "text-rose-500": "#f43f5e",
   "text-sky-500": "#0ea5e9",
   "text-sky-400": "#38bdf8",
   "text-gray-500": "#6b7280",
};

const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
   value,
   label: config.label,
   color: config.color.replace("text-", "bg-"),
   colorStyle: STATUS_COLOR_HEX[config.color] ?? STATUS_COLOR_HEX["text-gray-500"],
}));

export const ParcelsPage = (): React.ReactElement => {
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedStatus, setSelectedStatus] = useState<ParcelStatus | undefined>(undefined);
   const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
   const { pagination, setPagination } = usePagination();

   const trimmed = debouncedSearchQuery.trim();
   const searchIn =
      trimmed === ""
         ? ("description" as const)
         : /^\d+$/.test(trimmed)
           ? ("order_id" as const)
           : /^[A-Za-z0-9]+$/.test(trimmed) && /\d/.test(trimmed) && /[A-Za-z]/.test(trimmed)
             ? ("hbl" as const)
             : ("description" as const);

   const { data, isLoading, isFetching } = useParcels.search(
      debouncedSearchQuery,
      pagination.pageIndex,
      pagination.pageSize,
      selectedStatus,
      searchIn,
   );

   const parcels = (data?.rows ?? []) as Parcel[];
   const total = data?.total ?? 0;

   const hasActiveFilters = !!searchQuery || !!selectedStatus;

   const handleClearFilters = (): void => {
      setSearchQuery("");
      setSelectedStatus(undefined);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   };

   return (
      <div className="flex flex-col p-2 md:p-4 gap-4">
         <div className="flex flex-row justify-between">
            <div className="flex flex-col">
               <h3 className="font-bold">Paquetes</h3>
               <p className="text-sm text-gray-500">Listado de Paquetes</p>
            </div>
         </div>
         <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
               <div className="flex items-center lg:w-sm relative justify-start">
                  <Search className="w-4 h-4 absolute left-4 text-muted-foreground" />
                  <Input
                     type="search"
                     className="pl-10"
                     placeholder="Buscar..."
                     value={searchQuery}
                     onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                     }}
                  />
               </div>
               <div className="flex flex-wrap items-center gap-2">
                  <DataTableFacetedFilter
                     title="Estado"
                     options={statusOptions}
                     selectedValue={selectedStatus}
                     onSelect={(value) => {
                        setSelectedStatus((value ?? undefined) as ParcelStatus | undefined);
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                     }}
                  />
                  {hasActiveFilters && (
                     <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
                        Reset
                        <X className="ml-2 h-4 w-4" />
                     </Button>
                  )}
               </div>
            </div>
            <DataTableCustom<Parcel, unknown>
               columns={parcelColumns}
               data={{ rows: parcels, total }}
               pagination={pagination}
               setPagination={setPagination}
               isLoading={isLoading || isFetching}
            />
         </div>
      </div>
   );
};
