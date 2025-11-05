import React from "react";
import { receiversColumns } from "@/components/orders/receiver/receiver-columns";
import { DataTable } from "@/components/ui/data-table";
import { useReceivers } from "@/hooks/use-receivers";
import { useDebounce } from "use-debounce";
import { Loader2, Search } from "lucide-react";
import type { PaginationState } from "@tanstack/react-table";
import { useState } from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ReceiverFormDialog } from "@/components/orders/receiver/receiver-form-dialog";
export const ReceiversPage = () => {
   const [searchQuery, setSearchQuery] = React.useState("");
   const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 25,
   });
   const { data: receivers, isLoading } = useReceivers.search(
      debouncedSearchQuery,
      pagination.pageIndex,
      pagination.pageSize
   );

   return (
      <div>
         <div className="flex flex-col gap-4">
            <div className="flex flex-col ">
               <h3 className=" font-bold">Destinatarios</h3>
               <p className="text-sm text-gray-500 "> Listado de Destinatarios</p>
            </div>
            <div className="flex flex-col gap-4">
               <ButtonGroup orientation="horizontal" className="w-full lg:w-md">
                  <InputGroup>
                     <InputGroupInput
                        type="search"
                        placeholder="Buscar Destinatario..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                     <InputGroupAddon>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                     </InputGroupAddon>
                  </InputGroup>
                  <ReceiverFormDialog />
               </ButtonGroup>

               <DataTable
                  columns={receiversColumns}
                  data={receivers}
                  pagination={pagination}
                  setPagination={setPagination}
                  isLoading={isLoading}
               />
            </div>
         </div>
      </div>
   );
};
