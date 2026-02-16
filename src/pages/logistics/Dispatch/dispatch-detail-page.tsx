import { useParams, useNavigate } from "react-router-dom";
import { useDispatches } from "@/hooks/use-dispatches";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCents } from "@/lib/cents-utils";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { DispatchPaymentForm } from "@/components/dispatch/dispatch-payment-form";
import { DispatchPaymentsTable } from "@/components/dispatch/dispatch-payments-table";
import { dispatchStatus } from "@/data/types";
import type { DispatchPayment } from "@/data/types";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
   PENDING: "Pendiente",
   PAID: "Pagado",
   PARTIALLY_PAID: "Pago parcial",
   FULL_DISCOUNT: "Descuento",
   REFUNDED: "Reembolsado",
   CANCELLED: "Cancelado",
};

export function DispatchDetailPage(): React.ReactElement {
   const { dispatchId } = useParams<{ dispatchId: string }>();
   const navigate = useNavigate();
   const id = dispatchId ? parseInt(dispatchId, 10) : 0;

   const { data: dispatch, isLoading, isError } = useDispatches.getById(id);
   const { data: paymentsData } = useDispatches.getPayments(id);

   const payments: DispatchPayment[] = Array.isArray(paymentsData)
      ? paymentsData
      : ((paymentsData as { rows?: DispatchPayment[] })?.rows ?? []);

   const canAddPayment = dispatch?.status === dispatchStatus.RECEIVED && dispatch?.payment_status !== "PAID";
   const remainingCents = (dispatch?.cost_in_cents ?? 0) - (dispatch?.paid_in_cents ?? 0);

   if (isLoading || !dispatchId) {
      return (
         <div className="flex items-center justify-center p-8">
            <Spinner className="h-8 w-8" />
         </div>
      );
   }

   if (isError || !dispatch) {
      return (
         <div className="flex flex-col items-center justify-center gap-4 p-8">
            <p className="text-muted-foreground">Despacho no encontrado</p>
            <Button variant="outline" onClick={() => navigate("/logistics/dispatch/list")}>
               Volver al listado
            </Button>
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-4 p-2 md:p-4">
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/logistics/dispatch/list")}>
               <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
               <h3 className="font-bold">Despacho #{dispatch.id}</h3>
            </div>
         </div>

         <Card>
            <CardHeader>
               <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg">Resumen de pago</CardTitle>
                  <Badge variant="secondary">
                     {PAYMENT_STATUS_LABELS[dispatch.payment_status] ?? dispatch.payment_status}
                  </Badge>
               </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                     <p className="text-muted-foreground">Total (cost_in_cents)</p>
                     <p className="font-medium">{formatCents(dispatch.cost_in_cents ?? 0)}</p>
                  </div>
                  <div>
                     <p className="text-muted-foreground">Pagado (paid_in_cents)</p>
                     <p className="font-medium">{formatCents(dispatch.paid_in_cents ?? 0)}</p>
                  </div>
                  <div>
                     <p className="text-muted-foreground">Pendiente</p>
                     <p className="font-medium">{formatCents(remainingCents)}</p>
                  </div>
                  <div>
                     <p className="text-muted-foreground">Estado despacho</p>
                     <p className="font-medium">{dispatch.status}</p>
                  </div>
               </div>

               {canAddPayment && (
                  <>
                     <Separator />
                     <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">
                           Solo se pueden agregar pagos cuando el despacho está RECIBIDO y no está pagado en su
                           totalidad.
                        </p>
                        <DispatchPaymentForm dispatch={dispatch} />
                     </div>
                  </>
               )}

               {dispatch.status !== dispatchStatus.RECEIVED && dispatch.payment_status !== "PAID" && (
                  <p className="text-sm text-amber-600">
                     Los pagos solo se pueden agregar cuando el despacho está en estado &quot;Recibido&quot;.
                  </p>
               )}

               {dispatch.payment_status === "PAID" && (
                  <p className="text-sm text-muted-foreground">El despacho ya está pagado en su totalidad.</p>
               )}
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle className="text-lg">Pagos registrados</CardTitle>
            </CardHeader>
            <CardContent>
               <DispatchPaymentsTable dispatchId={dispatch.id} payments={payments} />
            </CardContent>
         </Card>

         <div className="text-xs text-muted-foreground">
            Creado: {dispatch.created_at ? format(new Date(dispatch.created_at), "dd/MM/yyyy HH:mm") : "—"}
            {dispatch.created_by?.name && ` · Por ${dispatch.created_by.name}`}
         </div>
      </div>
   );
}
