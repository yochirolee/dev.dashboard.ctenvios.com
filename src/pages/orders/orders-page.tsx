import { FilePlus2, Printer, Search, X } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { orderColumns } from "@/components/orders/order/order-columns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/dates/data-range-picker";
import { useOrders } from "@/hooks/use-orders";
import { ButtonGroup } from "@/components/ui/button-group";
import usePagination from "@/hooks/use-pagination";
export default function OrdersPage() {
   const navigate = useNavigate();

   const [searchQuery, setSearchQuery] = useState("");
   const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
   const [date, setDate] = useState<Date | undefined>(undefined);
   const { pagination, setPagination } = usePagination();

   const { data, isLoading, isFetching } = useOrders.search(
      debouncedSearchQuery,
      pagination.pageIndex,
      pagination.pageSize,
      date?.toISOString() || "",
      date?.toISOString() || ""
   );

   console.log(data, "data");

   const handleClearFilters = () => {
      setSearchQuery("");
      setPagination(pagination);
      setDate(undefined);
   };

   return (
      <div className="flex flex-col gap-4">
         <div className="flex flex-row justify-between">
            <div className="flex flex-col">
               <h3 className=" font-bold">Ordenes</h3>
               <p className="text-sm text-gray-500 "> Listado de Ordenes</p>
            </div>
            <ButtonGroup orientation="horizontal">
               <Button onClick={() => navigate("/orders/new")} variant="outline">
                  <FilePlus2 size={16} />
                  <span className="hidden md:block">Nueva Orden</span>
               </Button>
               <Button disabled={true} onClick={() => navigate("/orders/new")} variant="outline">
                  <Printer size={16} />
                  <span className="hidden md:block">Imprimir</span>
               </Button>
            </ButtonGroup>
         </div>
         <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
               <div className="flex items-center lg:w-sm relative justify-start">
                  <Search className="w-4 h-4 absolute left-4" />

                  <Input
                     type="search"
                     className="pl-10"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>

               <DatePickerWithRange date={date} setDate={setDate} />
               {(date || searchQuery) && (
                  <Button variant="ghost" onClick={handleClearFilters}>
                     Reset
                     <X className="w-4 h-4" />
                  </Button>
               )}
            </div>

            <DataTable
               columns={orderColumns}
               data={data}
               pagination={pagination}
               setPagination={setPagination}
               isLoading={isLoading || isFetching}
            />
         </div>
      </div>
   );
}
