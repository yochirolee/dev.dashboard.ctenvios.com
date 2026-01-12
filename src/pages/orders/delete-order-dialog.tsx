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
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const deleteOrderSchema = z.object({
   reason: z.string().min(1, "El motivo es requerido"),
});

export function DeleteOrderDialog({ order_id, asRedirect }: { order_id: number; asRedirect?: boolean }) {
   const form = useForm<z.infer<typeof deleteOrderSchema>>({
      resolver: zodResolver(deleteOrderSchema),
      defaultValues: {
         reason: "",
      },
   });

   const navigate = useNavigate();
   const { mutate: deleteOrder, isPending: isDeletingOrder } = useOrders.delete({
      onSuccess: (_order_id: number, _reason: string) => {
         toast.success("Orden eliminada correctamente");
         if (asRedirect) {
            navigate("/orders");
         }
      },
      onError: (error: any) => {
         toast.error(error.response.data.message);
      },
   });

   const onSubmit = (data: z.infer<typeof deleteOrderSchema>) => {
      deleteOrder({ order_id, reason: data.reason });
   };

   return (
      <AlertDialog>
         <AlertDialogTrigger asChild>
            <Button variant="ghost" className=" w-full flex justify-start items-center gap-4  ">
               <TrashIcon className="size-4 text-destructive -ml-1 " />
               Eliminar
            </Button>
         </AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>¿Estás seguro de querer eliminar esta orden?</AlertDialogTitle>
               <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <Form {...form}>
               <form id="delete-order-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                     control={form.control}
                     name="reason"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Motivo</FormLabel>
                           <FormControl>
                              <Input placeholder="Ingrese el motivo de eliminación" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <AlertDialogFooter>
                     <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
                     <AlertDialogAction type="submit" disabled={isDeletingOrder}>
                        {isDeletingOrder ? <Spinner /> : "Eliminar"}
                     </AlertDialogAction>
                  </AlertDialogFooter>
               </form>
            </Form>
         </AlertDialogContent>
      </AlertDialog>
   );
}
