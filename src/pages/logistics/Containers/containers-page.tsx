import { useContainers } from "@/hooks/use-containers";
import { DataTable } from "@/components/ui/data-table";
import { containersColumns } from "@/components/containers/containers-columns";
import { NewContainerForm } from "@/components/containers/new-container-form";
import { UpdateStatusContainerForm } from "@/components/containers/update-status-container-form";
import { ShareDialog } from "@/components/shares/share-dialog";
import { useState, useMemo, useCallback } from "react";
import { Container as ContainerIcon, Search, Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { toast } from "sonner";
import usePagination from "@/hooks/use-pagination";
import { Input } from "@/components/ui/input";
import { ButtonGroup } from "@/components/ui/button-group";
import type { Container } from "@/data/types";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ContainersPage = () => {
   const { pagination, setPagination } = usePagination();
   const { data, isLoading } = useContainers.get(pagination.pageIndex, pagination.pageSize);

   const deleteContainerMutation = useContainers.delete();

   const containers = data?.rows ?? [];
   const total = data?.total ?? 0;

   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
   const [openCreateDialog, setOpenCreateDialog] = useState(false);
   const [openStatusDialog, setOpenStatusDialog] = useState(false);
   const [containerId, setContainerId] = useState<number | undefined>(undefined);
   const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
   const [searchQuery, setSearchQuery] = useState("");

   const handleDeleteContainer = useCallback((container_id: number) => {
      setContainerId(container_id);
      setOpenDeleteDialog(true);
   }, []);

   const handleUpdateStatus = useCallback((container: Container) => {
      setSelectedContainer(container);
      setOpenStatusDialog(true);
   }, []);

   const confirmDelete = useCallback(() => {
      if (containerId === undefined) return;

      deleteContainerMutation.mutate(containerId, {
         onSuccess: () => {
            toast.success("Contenedor eliminado correctamente");
            setOpenDeleteDialog(false);
            setContainerId(undefined);
         },
         onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error al eliminar el contenedor");
         },
      });
   }, [containerId, deleteContainerMutation]);

   const columns = useMemo(
      () => containersColumns({ onDelete: handleDeleteContainer, onUpdateStatus: handleUpdateStatus }),
      [handleDeleteContainer, handleUpdateStatus],
   );

   if (isLoading) {
      return (
         <div className="flex items-center justify-center h-64">
            <Spinner />
         </div>
      );
   }

   if (containers.length === 0 && !searchQuery) {
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <ContainerIcon className="h-10 w-10" />
               </EmptyMedia>
               <EmptyTitle>No hay contenedores</EmptyTitle>
               <EmptyDescription>Crea un contenedor para empezar a gestionar tus envíos</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
               <ShareDialog
                  open={openCreateDialog}
                  setOpen={setOpenCreateDialog}
                  title="Crear Contenedor"
                  description="Crea un nuevo contenedor para gestionar tus envíos"
                  mode="create"
                  expanded
               >
                  <NewContainerForm setOpen={setOpenCreateDialog} />
               </ShareDialog>
            </EmptyContent>
         </Empty>
      );
   }

   return (
      <div className="flex flex-col gap-4 w-full p-2 md:p-4">
         <div className="flex w-full flex-row justify-between items-center">
            <div className="flex flex-col">
               <h3 className="font-bold">Contenedores</h3>
               <p className="text-sm text-gray-500">Listado de Contenedores</p>
            </div>
            <ButtonGroup orientation="horizontal" className="w-fit">
               <ShareDialog
                  open={openCreateDialog}
                  setOpen={setOpenCreateDialog}
                  title="Crear Contenedor"
                  description="Crea un nuevo contenedor para gestionar tus envíos"
                  mode="create"
               >
                  <NewContainerForm setOpen={setOpenCreateDialog} />
               </ShareDialog>
            </ButtonGroup>
         </div>

         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center w-sm relative justify-start">
                  {isLoading ? (
                     <Loader2 className="w-4 h-4 animate-spin absolute left-4" />
                  ) : (
                     <Search className="w-4 h-4 absolute left-4" />
                  )}
                  <Input
                     type="search"
                     className="pl-10"
                     placeholder="Buscar contenedor..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>

            <DataTable
               columns={columns}
               data={{ rows: containers, total }}
               pagination={pagination}
               setPagination={setPagination}
               isLoading={isLoading}
            />
         </div>

         {/* Delete Dialog */}
         <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                     Esta acción no se puede deshacer. Se eliminará permanentemente el contenedor y todos los datos
                     asociados.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={confirmDelete}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                     disabled={deleteContainerMutation.isPending}
                  >
                     {deleteContainerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                     Eliminar
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>

         {/* Update Status Dialog */}
         <Dialog open={openStatusDialog} onOpenChange={setOpenStatusDialog}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Cambiar Estado del Contenedor</DialogTitle>
                  <DialogDescription>
                     {selectedContainer?.container_name} - {selectedContainer?.container_number}
                  </DialogDescription>
               </DialogHeader>
               {selectedContainer && (
                  <UpdateStatusContainerForm
                     containerId={selectedContainer.id}
                     currentStatus={selectedContainer.status}
                     setOpen={setOpenStatusDialog}
                  />
               )}
            </DialogContent>
         </Dialog>
      </div>
   );
};
