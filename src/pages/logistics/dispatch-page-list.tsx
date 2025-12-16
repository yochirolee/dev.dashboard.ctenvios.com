import { useDispatches } from "@/hooks/use-dispatches";
import { DataTable } from "@/components/ui/data-table";
import { dispatchColumns } from "../../components/dispatch/dispatch-columns";
import { useState, useMemo, useCallback } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Group, PackageOpen, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { toast } from "sonner";
import { AlertDeleteDispatch } from "@/components/dispatch/alert-delete-dispatch";

export const DispatchPageLists = () => {
   const { data, isLoading } = useDispatches.get();
   const navigate = useNavigate();
   const dispatches = data?.rows ?? [];
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 25,
   });
   const createDispatchMutation = useDispatches.create();
   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

   const [dispatchId, setDispatchId] = useState<number | undefined>(undefined);

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
console.log(data, "data");
   if (isLoading)
      return (
         <div>
            <Spinner />
         </div>
      );
   if (dispatches.length === 0)
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <Group />
               </EmptyMedia>
               <EmptyTitle>No hay despachos</EmptyTitle>
               <EmptyDescription>Crea un despacho para empezar</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
               <Button variant="outline" onClick={handleCreateDispatch}>
                  <PackagePlus size={16} />
                  <span className="hidden md:block">Crear</span>
               </Button>
            </EmptyContent>
         </Empty>
      );
   return (
      <div className="flex flex-col gap-4 w-full p-2 md:p-4">
         <div className="flex w-full flex-row justify-between items-center">
            <div className="flex flex-col">
               <h3 className=" font-bold">Despachos</h3>
               <p className="text-sm text-gray-500 "> Listado de Despachos</p>
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
         {dispatchId !== undefined && (
            <AlertDeleteDispatch open={openDeleteDialog} setOpen={setOpenDeleteDialog} dispatchId={dispatchId} />
         )}
         <DataTable
            columns={columns}
            data={{ rows: dispatches || [], total: dispatches.length }}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
         />
      </div>
   );
};
