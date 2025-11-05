import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Loader2, Search } from "lucide-react";
import { customsColumns } from "@/components/customs/customs-columns";
import { useCustoms } from "@/hooks/use-customs";
import { NewCustomsForm } from "@/components/customs/new-customs-form";
import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import type { Customs } from "@/data/types";
import { AlertDeleteDialog } from "@/components/customs/alert-delete-dialog";
import { useDebounce } from "use-debounce";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
export const CustomsPage = () => {
   const [searchQuery, setSearchQuery] = React.useState("");
   const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 25,
   });
   const { data, isLoading } = useCustoms.search(debouncedSearchQuery, pagination.pageIndex, pagination.pageSize);

   console.log(data, "data");

   const [customsRate, setCustomsRate] = useState<Customs | undefined>(undefined);
   const [open, setOpen] = useState(false);
   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

   const handleEdit = (customsRate: Customs) => {
      setCustomsRate(customsRate);
      setOpen(true);
   };

   const handleDelete = (customsRate: Customs) => {
      setCustomsRate(customsRate);
      setOpenDeleteDialog(true);
   };

   return (
      <div className="flex flex-col gap-4">
         <div className="flex flex-col ">
            <h3 className=" font-bold">Aranceles Aduanales</h3>
            <p className="text-sm text-gray-500 "> Listado de Aranceles Aduanales</p>
         </div>
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <ButtonGroup orientation="horizontal" className="w-full lg:w-md">
                  <InputGroup>
                     <InputGroupInput
                        type="search"
                        placeholder="Buscar Arancel Aduanal..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                     <InputGroupAddon>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                     </InputGroupAddon>
                  </InputGroup>
                  <NewCustomsForm
                     customsRate={customsRate}
                     setCustomsRate={setCustomsRate}
                     open={open}
                     setOpen={setOpen}
                  />
               </ButtonGroup>

               <AlertDeleteDialog
                  open={openDeleteDialog}
                  setOpen={setOpenDeleteDialog}
                  customsRate={customsRate as Customs}
                  setCustomsRate={setCustomsRate}
               />
            </div>

            <DataTable
               columns={customsColumns(handleEdit, handleDelete)}
               data={data}
               pagination={pagination}
               setPagination={setPagination}
               isLoading={isLoading}
            />
         </div>
      </div>
   );
};
