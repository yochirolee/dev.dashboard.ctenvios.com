import { usePallets } from "@/hooks/use-pallets";
import { DataTable } from "@/components/ui/data-table";
import { palletsColumns } from "@/components/palllets/pallets-columns";
import { useState, useMemo, useCallback } from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Layers, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { toast } from "sonner";
import { AlertDeletePallet } from "@/components/palllets/alert-delete-pallet";
import usePagination from "@/hooks/use-pagination";

export const PalletsPage = () => {
   const { pagination, setPagination } = usePagination();
   const { data, isLoading } = usePallets.get(pagination.pageIndex, pagination.pageSize);
   const navigate = useNavigate();
   const pallets = data?.rows ?? [];
   const total = data?.total ?? pallets.length;
   const createPalletMutation = usePallets.create();
   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
   const [palletId, setPalletId] = useState<number | undefined>(undefined);

   const handleDeletePallet = useCallback((pallet_id: number) => {
      setPalletId(pallet_id);
      setOpenDeleteDialog(true);
   }, []);

   const handleCreatePallet = useCallback(() => {
      createPalletMutation.mutate(undefined, {
         onSuccess: (created) => {
            toast.success("Pallet creado correctamente");
            // Keep parity with dispatch flow: create -> edit page
            if (created?.id) {
               navigate(`/logistics/pallets/create/${created.id}`);
               return;
            }
            navigate(`/logistics/pallets`);
         },
         onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al crear el pallet");
         },
      });
   }, [createPalletMutation, navigate]);

   const columns = useMemo(() => palletsColumns(handleDeletePallet), [handleDeletePallet]);

   if (isLoading) {
      return (
         <div>
            <Spinner />
         </div>
      );
   }

   if (pallets.length === 0) {
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <Layers />
               </EmptyMedia>
               <EmptyTitle>No hay pallets</EmptyTitle>
               <EmptyDescription>Crea un pallet para empezar</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
               <Button variant="outline" onClick={handleCreatePallet}>
                  <PackagePlus size={16} />
                  <span className="hidden md:block">Crear</span>
               </Button>
            </EmptyContent>
         </Empty>
      );
   }

   return (
      <div className="flex flex-col gap-4 w-full p-2 md:p-4">
         <div className="flex w-full flex-row justify-between items-center">
            <div className="flex flex-col">
               <h3 className=" font-bold">Pallets</h3>
               <p className="text-sm text-gray-500 "> Listado de Pallets</p>
            </div>
            <ButtonGroup orientation="horizontal" className="w-fit">
               <Button variant="outline" onClick={handleCreatePallet}>
                  <PackagePlus size={16} />
                  <span className="hidden md:block">Crear</span>
               </Button>
            </ButtonGroup>
         </div>

         {palletId !== undefined && (
            <AlertDeletePallet open={openDeleteDialog} setOpen={setOpenDeleteDialog} palletId={palletId} />
         )}

         <DataTable
            columns={columns}
            data={{ rows: pallets || [], total }}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
         />
      </div>
   );
};
