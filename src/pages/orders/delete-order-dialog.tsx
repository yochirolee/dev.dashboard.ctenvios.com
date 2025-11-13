import { Button } from "@/components/ui/button";

import { useOrders } from "@/hooks/use-orders";
import { toast } from "sonner";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { TrashIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DeleteOrderDialog({ order_id, asRedirect }: { order_id: number; asRedirect?: boolean }) {
   const navigate = useNavigate();
   const { mutate: deleteOrder, isPending: isDeletingOrder } = useOrders.delete({
      onSuccess: () => {
         toast.success("Order deleted successfully");
         if (asRedirect) {
            navigate("/orders");
         }
      },
      onError: (error: any) => {
         toast.error(error.response.data.message);
      },
   });

   const handleDelete = () => {
      deleteOrder(order_id);
   };

   return (
      <AlertDialog>
         <AlertDialogTrigger asChild>
            <Button variant="ghost" className=" w-full flex justify-start items-center gap-2  ">
               <TrashIcon className="size-4 text-destructive mr-2" />
               Eliminar
            </Button>
         </AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>¿Estás seguro de querer eliminar esta orden?</AlertDialogTitle>
               <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
               <AlertDialogCancel>Cancelar</AlertDialogCancel>
               <AlertDialogAction onClick={handleDelete}>
                  {isDeletingOrder ? (
                     <>
                        <Spinner /> Eliminando...
                     </>
                  ) : (
                     "Eliminar"
                  )}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
