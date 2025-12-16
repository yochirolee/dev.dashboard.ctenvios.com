import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { formatFullName } from "@/lib/cents-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Spinner } from "../ui/spinner";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { TriangleAlert } from "lucide-react";

interface Parcel {
   id: number;
   tracking_number: string;
   description: string;
   weight: number;
}

export function IssueOrderDetails({ order_id, affected_parcels }: { order_id: number; affected_parcels: any[] }) {
   const { data: order, isLoading, error } = useOrders.getParcelsByOrderId(order_id);
   if (isLoading) {
      return (
         <div className="flex items-center justify-center h-full">
            <Spinner />
         </div>
      );
   }

   if (error) {
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <TriangleAlert />
               </EmptyMedia>
               <EmptyTitle>Error</EmptyTitle>
               <EmptyDescription>Error loading order details</EmptyDescription>
            </EmptyHeader>
         </Empty>
      );
   }

   return (
      <div className="flex flex-col h-full overflow-hidden">
         <div className="flex-1 min-h-0 overflow-y-auto p-2">
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                     <div className="flex flex-col justify-between gap-2">
                        <span className=""> {order?.agency?.name}</span>
                        <span className="text-muted-foreground">Order: {order?.id}</span>
                     </div>
                     <div className="flex flex-col justify-between gap-2 text-right">
                        <span className="text-muted-foreground text-xs text-right">Created </span>
                        <span className="text-muted-foreground text-xs text-right">
                           {format(new Date(order?.created_at), "dd/MM/yyyy hh:mm a")}
                        </span>
                     </div>
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                     <div className="flex flex-col gap-2">
                        {formatFullName(
                           order.customer?.first_name,
                           order.customer?.middle_name,
                           order.customer?.last_name,
                           order.customer?.second_last_name
                        )}
                        <div className="flex flex-col gap-2">{order.customer?.phone || order.customer?.mobile}</div>
                     </div>

                     <div className="flex flex-col gap-2">
                        {formatFullName(
                           order.receiver?.first_name,
                           order.receiver?.middle_name,
                           order.receiver?.last_name,
                           order.receiver?.second_last_name
                        )}
                        <div className="flex flex-col gap-2">{order.receiver?.phone || order.receiver?.mobile}</div>
                        <div className="flex flex-col gap-2">{order.receiver?.address}</div>
                        <div className="flex flex-col gap-2">{order.receiver?.province?.name}</div>
                        <div className="flex flex-col gap-2">{order.receiver?.city?.name}</div>
                     </div>
                  </div>
               </CardContent>
               <CardContent>
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>HBL</TableHead>
                           <TableHead>Description</TableHead>
                           <TableHead>Weight</TableHead>
                           <TableHead>Affected</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {order?.parcels.map((parcel: Parcel) => {
                           const isAffected = affected_parcels.some((ap) => ap.parcel_id === parcel.id);
                           return (
                              <TableRow
                                 key={parcel.id}
                                 className={isAffected ? "bg-red-500/10" : "text-muted-foreground"}
                              >
                                 <TableCell>{parcel.tracking_number}</TableCell>
                                 <TableCell>{parcel.description}</TableCell>
                                 <TableCell>{parcel.weight}</TableCell>
                                 <TableCell>{isAffected ? "Yes" : "No"}</TableCell>
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
