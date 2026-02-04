import { useState } from "react";
import { Search, X } from "lucide-react";
import { useLiveParcels } from "@/collections/parcels-collections";
import { parcelColumns, type Parcel } from "@/components/tracking/parcels-columns";
import { ParcelsTable } from "@/components/tracking/parcels-table";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { STATUS_CONFIG } from "@/lib/parcel-status";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
   value,
   label: config.label,
   color: config.color.replace("text-", "bg-"),
}));

export const ParcelsTrackingPage = (): React.ReactElement => {
   const [searchQuery, setSearchQuery] = useState("");
   const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
   const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

   const parcels = useLiveParcels({
      status: selectedStatus,
      search: debouncedSearchQuery,
   });

   const hasActiveFilters = !!searchQuery || !!selectedStatus;

   const handleClearFilters = () => {
      setSearchQuery("");
      setSelectedStatus(undefined);
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
                  <Search className="w-4 h-4 absolute left-4" />
                  <Input
                     type="search"
                     className="pl-10"
                     placeholder="Buscar tracking, descripción, orden..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <DataTableFacetedFilter
                     title="Estado"
                     options={statusOptions}
                     selectedValue={selectedStatus}
                     onSelect={setSelectedStatus}
                  />

                  {hasActiveFilters && (
                     <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
                        Reset
                        <X className="ml-2 w-4 h-4" />
                     </Button>
                  )}
               </div>
            </div>

            <ParcelsTable columns={parcelColumns} data={parcels as Parcel[]} />
         </div>
      </div>
   );
};
