import { useDispatches } from "@/hooks/use-dispatches";
import { DataTable } from "@/components/ui/data-table";
import { dispatchColumns } from "../../components/dispatch/dispatch-columns";
import { useState, useMemo, useCallback } from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Group, PackageOpen, PackagePlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { toast } from "sonner";
import { AlertDeleteDispatch } from "@/components/dispatch/alert-delete-dispatch";
import usePagination from "@/hooks/use-pagination";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { Input } from "@/components/ui/input";

// Status options with colors
const statusOptions = [
   { value: "DRAFT", label: "Borrador", color: "bg-gray-400" },
   { value: "LOADING", label: "Cargando", color: "bg-blue-400" },
   { value: "DISPATCHED", label: "Despachado", color: "bg-yellow-400" },
   { value: "RECEIVING", label: "Recibiendo", color: "bg-orange-400" },
   { value: "RECEIVED", label: "Recibido", color: "bg-green-400" },
   { value: "DISCREPANCY", label: "Discrepancia", color: "bg-red-400" },
   { value: "CANCELLED", label: "Cancelado", color: "bg-red-600" },
];

// Payment status options with colors
const paymentStatusOptions = [
   { value: "PENDING", label: "Pendiente", color: "bg-yellow-400" },
   { value: "PAID", label: "Pagado", color: "bg-green-400" },
   { value: "PARTIALLY_PAID", label: "Pago Parcial", color: "bg-orange-400" },
   { value: "FULL_DISCOUNT", label: "Descuento Total", color: "bg-blue-400" },
   { value: "REFUNDED", label: "Reembolsado", color: "bg-purple-400" },
   { value: "CANCELLED", label: "Cancelado", color: "bg-red-600" },
];

export const DispatchPageLists = () => {
   const { pagination, setPagination } = usePagination();
   const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
   const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string | undefined>(undefined);
   const [searchDispatchId, setSearchDispatchId] = useState<string>("");

   // Parse dispatch_id as number if valid
   const dispatchIdNumber = searchDispatchId ? parseInt(searchDispatchId, 10) : undefined;
   const validDispatchId = dispatchIdNumber && !isNaN(dispatchIdNumber) ? dispatchIdNumber : undefined;

   const { data, isLoading } = useDispatches.get(
      pagination.pageIndex,
      pagination.pageSize,
      selectedStatus,
      selectedPaymentStatus,
      validDispatchId
   );
   const navigate = useNavigate();
   const dispatches = data?.rows ?? [];
   const total = data?.total ?? 0;
   const createDispatchMutation = useDispatches.create();
   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

   const [dispatchId, setDispatchId] = useState<number | undefined>(undefined);

   // Clear filters
   const clearFilters = useCallback((): void => {
      setSelectedStatus(undefined);
      setSelectedPaymentStatus(undefined);
      setSearchDispatchId("");
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
   }, [setPagination]);

   const hasActiveFilters = !!selectedStatus || !!selectedPaymentStatus || !!searchDispatchId;

   const handleDeleteDispatch = useCallback((dispatch_id: number) => {
      setDispatchId(dispatch_id);
      setOpenDeleteDialog(true);
   }, []);

   const handleCreateDispatch = useCallback(() => {
      createDispatchMutation.mutate(undefined, {
         onSuccess: (data) => {
            console.log(data, "data in create dispatch");
            toast.success("Despacho creado correctamente");
            navigate(`/logistics/dispatch/create/${data.id}`);
         },
         onError: (error: any) => {
            toast.error(error.response.data.message);
         },
      });
   }, [createDispatchMutation, navigate]);

   // Memoize columns to prevent recreation on every render
   const columns = useMemo(() => dispatchColumns(handleDeleteDispatch), [handleDeleteDispatch]);

   // Only show empty component if no filters are active
   if (dispatches.length === 0 && !hasActiveFilters)
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <Group />
               </EmptyMedia>
               <EmptyTitle>No hay despachos</EmptyTitle>
               <EmptyDescription>Crea un despacho para empezar</EmptyDescription>
            </EmptyHeader>
            <EmptyContent >
               <div className="flex flex-row gap-2">
               <Button variant="outline" onClick={handleCreateDispatch}>
                  <PackagePlus size={16} />
                     <span className="hidden md:block">Crear</span>
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/logistics/dispatch/receive")}>
                     <PackageOpen size={16} />
                     <span className="hidden md:block">Recibir</span>
                  </Button>
               </div>
            </EmptyContent>
         </Empty>
      );

   return (
      <div className="flex flex-col gap-4 w-full p-2 md:p-4">
         <div className="flex w-full flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
               <div className="flex flex-col">
                  <h3 className="font-bold">Despachos</h3>
                  <p className="text-sm text-gray-500">Listado de Despachos</p>
               </div>
               <ButtonGroup orientation="horizontal" className="w-fit">
                  <Button variant="outline" onClick={handleCreateDispatch}>
                     <PackagePlus size={16} />
                     <span className="hidden md:block">Crear</span>
                  </Button>

                  <Button variant="outline" onClick={() => navigate("/logistics/dispatch/receive")}>
                     <PackageOpen size={16} />
                     <span className="hidden md:block">Recibir</span>
                  </Button>
               </ButtonGroup>
            </div>

            {/* Filters - shadcn Tasks style */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
               <Input
                  placeholder="Buscar por ID..."
                  type="number"
                  value={searchDispatchId}
                  onChange={(e) => {
                     setSearchDispatchId(e.target.value);
                     setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                  className="h-8 w-full md:w-[150px] lg:w-[200px]"
               />
               <div className="flex flex-wrap items-center gap-2">
                  <DataTableFacetedFilter
                     title="Status"
                     options={statusOptions}
                     selectedValue={selectedStatus}
                     onSelect={(value) => {
                        setSelectedStatus(value);
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                     }}
                  />
                  <DataTableFacetedFilter
                     title="Pago"
                     options={paymentStatusOptions}
                     selectedValue={selectedPaymentStatus}
                     onSelect={(value) => {
                        setSelectedPaymentStatus(value);
                        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                     }}
                  />
                  {hasActiveFilters && (
                     <Button variant="ghost" onClick={clearFilters} className="h-8 px-2 lg:px-3">
                        Reset
                        <X className="ml-2 h-4 w-4" />
                     </Button>
                  )}
               </div>
            </div>
         </div>
         {dispatchId !== undefined && (
            <AlertDeleteDispatch open={openDeleteDialog} setOpen={setOpenDeleteDialog} dispatchId={dispatchId} />
         )}
         <DataTable
            columns={columns}
            data={{ rows: dispatches || [], total: total }}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
         />
      </div>
   );
};
