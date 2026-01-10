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
import { useDispatches } from "@/hooks/use-dispatches";
import { Spinner } from "../ui/spinner";


export function AlertDeleteDispatch({
   open,
   setOpen,
   dispatchId,
}: {
   open: boolean;
   setOpen: (open: boolean) => void;
   dispatchId: number;
}) {
   const deleteDispatchMutation = useDispatches.deleteDispatch();

   const handleDelete = () => {
      deleteDispatchMutation.mutate(dispatchId, {
         onSuccess: () => {
            toast.success("Despacho eliminado correctamente");
            setOpen(false);
         },
         onError: (error: any) => {
            toast.error(error.response.data.message);
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
                  disabled={deleteDispatchMutation.isPending}
               >
                  {deleteDispatchMutation.isPending ? <Spinner /> : "Eliminar"}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
