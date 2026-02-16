import { useState } from "react";
import type { DispatchPayment } from "@/data/types";
import { formatCents } from "@/lib/cents-utils";
import { format } from "date-fns";
import { useDispatches } from "@/hooks/use-dispatches";
import { toast } from "sonner";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Trash2 } from "lucide-react";
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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
   CASH: "Efectivo",
   CHECK: "Cheque",
   ZELLE: "Zelle",
   CREDIT_CARD: "Tarjeta de Crédito",
   DEBIT_CARD: "Tarjeta de Débito",
   BANK_TRANSFER: "Transferencia",
   PAYPAL: "PayPal",
   OTHER: "Otro",
};

export function DispatchPaymentsTable({
   dispatchId,
   payments,
}: {
   dispatchId: number;
   payments: DispatchPayment[];
}): React.ReactElement {
   const [deletingId, setDeletingId] = useState<number | null>(null);
   const deletePaymentMutation = useDispatches.deletePayment(dispatchId);

   const handleDelete = (paymentId: number): void => {
      setDeletingId(paymentId);
      deletePaymentMutation.mutate(paymentId, {
         onSuccess: () => {
            setDeletingId(null);
            toast.success("Pago eliminado");
         },
         onError: (error: unknown) => {
            setDeletingId(null);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err?.response?.data?.message ?? "Error al eliminar el pago");
         },
      });
   };

   if (payments.length === 0) {
      return (
         <p className="text-sm text-muted-foreground py-4">No hay pagos registrados.</p>
      );
   }

   return (
      <Table>
         <TableHeader>
            <TableRow>
               <TableHead>Monto</TableHead>
               <TableHead>Método</TableHead>
               <TableHead>Fecha</TableHead>
               <TableHead>Referencia</TableHead>
               <TableHead className="w-[80px]" />
            </TableRow>
         </TableHeader>
         <TableBody>
            {payments.map((payment) => (
               <TableRow key={payment.id}>
                  <TableCell>
                     {formatCents(payment.amount_in_cents + (payment.charge_in_cents ?? 0))}
                  </TableCell>
                  <TableCell>
                     {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                  </TableCell>
                  <TableCell>
                     {format(
                        new Date(payment.date ?? payment.created_at ?? ""),
                        "dd/MM/yyyy HH:mm"
                     )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                     {payment.reference ?? "—"}
                  </TableCell>
                  <TableCell>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                              {deletingId === payment.id ? (
                                 <Spinner className="h-4 w-4" />
                              ) : (
                                 <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                           <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar pago</AlertDialogTitle>
                              <AlertDialogDescription>
                                 ¿Seguro que deseas eliminar este pago de{" "}
                                 {formatCents(payment.amount_in_cents)}?
                              </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                 onClick={() => handleDelete(payment.id)}
                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                 Eliminar
                              </AlertDialogAction>
                           </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                  </TableCell>
               </TableRow>
            ))}
         </TableBody>
      </Table>
   );
}
