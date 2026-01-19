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
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { usePallets } from "@/hooks/use-pallets";

export function AlertDeletePallet({
   open,
   setOpen,
   palletId,
}: {
   open: boolean;
   setOpen: (open: boolean) => void;
   palletId: number;
}) {
   const deletePalletMutation = usePallets.deletePallet();

   const handleDelete = (): void => {
      deletePalletMutation.mutate(palletId, {
         onSuccess: () => {
            toast.success("Pallet eliminado correctamente");
            setOpen(false);
         },
         onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al eliminar el pallet");
         },
      });
   };

   return (
      <AlertDialog open={open} onOpenChange={setOpen}>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>¿Estás seguro de querer eliminar este registro?</AlertDialogTitle>
               <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel>Cancelar</AlertDialogCancel>
               <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                  disabled={deletePalletMutation.isPending}
               >
                  {deletePalletMutation.isPending ? <Spinner /> : "Eliminar"}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
