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
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { useAgencies } from "@/hooks/use-agencies";
import { useAppStore } from "@/stores/app-store";
import { ROLE_GROUPS } from "@/lib/rbac";

const paymentStatusOptions = [
   { value: "PENDING", label: "Pendiente", color: "bg-yellow-400" },
   { value: "PAID", label: "Pagado", color: "bg-green-400" },
   { value: "PARTIALLY_PAID", label: "Parcial", color: "bg-orange-400" },
   { value: "FULL_DISCOUNT", label: "Descuento", color: "bg-blue-400" },
   { value: "REFUNDED", label: "Reembolsado", color: "bg-purple-400" },
   { value: "CANCELLED", label: "Cancelado", color: "bg-red-600" },
];

export default function OrdersPage() {
   const navigate = useNavigate();
   const [searchQuery, setSearchQuery] = useState("");
   const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
   const [date, setDate] = useState<Date | undefined>(undefined);
   const { pagination, setPagination } = usePagination();
   const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string | undefined>(undefined);
   const [selectedAgencyId, setSelectedAgencyId] = useState<number | undefined>(undefined);

   // Check if admin
   const user = useAppStore((state) => state.user);
   const userRole = (user as any)?.role as string;
   const isAdmin = ROLE_GROUPS.SYSTEM_ADMINS.includes(userRole as any);

   // Fetch agencies for admin users
   const { data: agencies } = useAgencies.get();

   const { data, isLoading, isFetching } = useOrders.search(
      debouncedSearchQuery,
      pagination.pageIndex,
      pagination.pageSize,
      date?.toISOString() || "",
      date?.toISOString() || "",
      selectedPaymentStatus,
      selectedAgencyId
   );

   const hasActiveFilters = !!searchQuery || !!date || !!selectedPaymentStatus || !!selectedAgencyId;

   const handleClearFilters = () => {
      setSearchQuery("");
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      setDate(undefined);
      setSelectedPaymentStatus(undefined);
      setSelectedAgencyId(undefined);
   };

   return (
      <div className="flex flex-col p-2 md:p-4  gap-4">
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
            {/* Filters */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
               <div className="flex items-center lg:w-sm relative justify-start">
                  <Search className="w-4 h-4 absolute left-4" />
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
                  <DatePickerWithRange date={date} setDate={setDate} />

                  <DataTableFacetedFilter
                     title="Pago"
                     options={paymentStatusOptions}
                     selectedValue={selectedPaymentStatus}
                     onSelect={(value) => {
                        setSelectedPaymentStatus(value);
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                     }}
                  />

                  {/* Agency Filter (Admin only) */}
                  {isAdmin && agencies && (
                     <DataTableFacetedFilter
                        title="Agencia"
                        options={agencies.map((agency: any) => ({
                           value: agency.id.toString(),
                           label: agency.name,
                        }))}
                        selectedValue={selectedAgencyId?.toString()}
                        onSelect={(value) => {
                           setSelectedAgencyId(value ? parseInt(value) : undefined);
                           setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                        }}
                     />
                  )}

                  {hasActiveFilters && (
                     <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
                        Reset
                        <X className="ml-2 w-4 h-4" />
                     </Button>
                  )}
               </div>
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
