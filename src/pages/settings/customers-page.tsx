import React from "react";
import { columns } from "@/components/orders/customer/columns";
import { DataTable } from "@/components/ui/data-table";
import { useCustomers } from "@/hooks/use-customers";
import { useDebounce } from "use-debounce";
import { Loader2, Search } from "lucide-react";
import { CustomerFormDialog } from "@/components/orders/customer/customer-form-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import usePagination from "@/hooks/use-pagination";
export const CustomersPage = () => {
   const [searchQuery, setSearchQuery] = React.useState("");
   const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
   const { pagination, setPagination } = usePagination();
   const { data, isLoading } = useCustomers.search(debouncedSearchQuery, pagination.pageIndex, pagination.pageSize);

   return (
      <div className="flex flex-col gap-4">
         <div className="flex flex-col ">
            <h3 className=" font-bold">Clientes</h3>
            <p className="text-sm text-gray-500 "> Listado de Clientes</p>
         </div>
         <div className="flex flex-col gap-4 ">
            <ButtonGroup orientation="horizontal" className="w-full lg:w-md">
               <InputGroup>
                  <InputGroupInput
                     type="search"
                     placeholder="Buscar Cliente..."
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <InputGroupAddon>
                     {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </InputGroupAddon>
               </InputGroup>
               <CustomerFormDialog />
            </ButtonGroup>

            <DataTable
               pagination={pagination}
               setPagination={setPagination}
               columns={columns}
               data={data}
               isLoading={isLoading}
            />
         </div>
      </div>
   );
};
