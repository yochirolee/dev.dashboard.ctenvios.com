import { useParams, useNavigate } from "react-router-dom";
import { useDispatches } from "@/hooks/use-dispatches";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ReceiptText, TrendingUpIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/cents-utils";
import { Spinner } from "@/components/ui/spinner";
import { DispatchPaymentForm } from "@/components/dispatch/dispatch-payment-form";
import { DispatchPaymentsTable } from "@/components/dispatch/dispatch-payments-table";
import { dispatchStatus } from "@/data/types";
import type { Dispatch, DispatchPayment } from "@/data/types";
import { ButtonGroup } from "@/components/ui/button-group";
const baseUrl = import.meta.env.VITE_API_URL;
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
         <div className="flex items-center h-full justify-center p-8">
            <Spinner />
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
   const handlePrintReceipt = () => {
      window.open(`${baseUrl}/dispatches/${dispatch.id}/payment-receipt`, "_blank");
   };

   return (
      <div className="flex flex-col gap-4 p-2 md:p-4 container  max-w-screen-xl mx-auto">
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/logistics/dispatch/list")}>
               <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
               <h3 className="font-bold">Despacho #{dispatch.id}</h3>
               <p className="text-sm text-gray-500 ">Detalles del Despacho</p>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Total a pagar */}
            <Card>
               <CardHeader className="relative">
                  <CardDescription>Total a pagar</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                     {formatCents(dispatch.cost_in_cents ?? 0)}
                  </CardTitle>
                  <div className="absolute right-4 top-4">
                     <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                        <TrendingUpIcon className="size-3" />
                        {dispatch.declared_parcels_count} paquetes
                     </Badge>
                  </div>
               </CardHeader>
               <CardFooter className="flex flex-col items-start gap-1 text-sm">
                  <div className="flex gap-2 font-medium">Cobrado: {formatCents(dispatch.paid_in_cents ?? 0)}</div>
                  <div className="text-muted-foreground">Pendiente: {formatCents(remainingCents)}</div>
               </CardFooter>
            </Card>

            {/* Pendiente de pago */}
            <Card>
               <CardHeader className="relative">
                  <CardDescription>Pendiente de pago</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">{formatCents(remainingCents)}</CardTitle>
                  <div className="absolute right-4 top-4">
                     <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                        <TrendingUpIcon className="size-3" />
                        {dispatch.declared_parcels_count} paquetes
                     </Badge>
                  </div>
               </CardHeader>
               <CardFooter className="flex flex-col items-start gap-1 text-sm">
                  <div className="flex gap-2 font-medium">Peso total: {dispatch.weight ?? 0} lbs</div>
               </CardFooter>
            </Card>

            {/* Pagado */}
            <Card>
               <CardHeader className="relative">
                  <CardDescription>Pagado</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                     {formatCents(dispatch.paid_in_cents ?? 0)}
                  </CardTitle>
                  <div className="absolute right-4 top-4" />
               </CardHeader>
               <CardFooter className="flex flex-col items-start gap-1 text-sm">
                  <div className="flex gap-2 font-medium">Peso total: {dispatch.weight ?? 0} lbs</div>
               </CardFooter>
            </Card>

            {/* Pagos registrados — spans 2 columns */}
         </div>
         <Card>
            <CardHeader>
               <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                     <CardTitle className="text-lg">Pagos registrados</CardTitle>
                     <CardDescription>Registra un pago para este despacho</CardDescription>
                  </div>
                  <ButtonGroup>
                     {canAddPayment && <DispatchPaymentForm dispatch={dispatch as Dispatch} />}
                     <Button variant="outline" onClick={handlePrintReceipt}>
                        <ReceiptText className="w-4 h-4" />
                        Imprimir Recibo
                     </Button>
                  </ButtonGroup>
               </div>
            </CardHeader>
            <CardContent>
               <DispatchPaymentsTable dispatchId={dispatch.id} payments={payments} />
            </CardContent>
         </Card>

         {dispatch.status !== dispatchStatus.RECEIVED && dispatch.payment_status !== "PAID" && (
            <p className="text-sm text-amber-600">
               Los pagos solo se pueden agregar cuando el despacho está en estado &quot;Recibido&quot;.
            </p>
         )}
         {dispatch.payment_status === "PAID" && (
            <p className="text-sm text-muted-foreground">El despacho ya está pagado en su totalidad.</p>
         )}
      </div>
   );
}
