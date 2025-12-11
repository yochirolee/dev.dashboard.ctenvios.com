import { useParams } from "react-router-dom";
import { useOrders } from "@/hooks/use-orders";
import {
   MapPin,
   Phone,
   User,
   PrinterIcon,
   Plane,
   Ship,
   CreditCard,
   TagIcon,
   Edit2Icon,
   ArchiveIcon,
   EllipsisVerticalIcon,
   CogIcon,
   FileWarning,
   FileTextIcon,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { PaymentForm } from "@/components/orders/payments/payment-form";
import { cn } from "@/lib/utils";
import { calculate_row_subtotal, formatFullName, formatCents } from "@/lib/cents-utils";
import { Card } from "@/components/ui/card";
import type { OrderItems, Payment } from "@/data/types";
import { OrderNotFound } from "@/components/orders/order-details/order-not-found";
import { PaymentsDetails } from "@/components/orders/payments/payments-details";
import { ButtonGroup } from "@/components/ui/button-group";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
   DropdownMenuGroup,
   DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { DeleteOrderDialog } from "./delete-order-dialog";
import { DiscountsDetails } from "@/components/orders/discounts/discounts.details";
const baseUrl = import.meta.env.VITE_API_URL;

export default function OrderDetailsPage() {
   const { orderId } = useParams();

   const { data: order, isLoading, error } = useOrders.getById(Number(orderId));

   const subtotal = order?.order_items.reduce(
      (acc: number, item: OrderItems) =>
         acc +
         calculate_row_subtotal(
            item?.price_in_cents,
            item?.weight,
            item?.customs_fee_in_cents,
            item?.charge_fee_in_cents,
            item?.insurance_fee_in_cents,
            item?.unit
         ),
      0
   );

   const total_weight = order?.order_items.reduce(
      (acc: number, item: OrderItems) => acc + Number(item?.weight) || 0,
      0
   );
   const handlePrintOrder = () => {
      window.open(`${baseUrl}/orders/${orderId}/pdf`, "_blank");
   };
   const handlePrintLabels = () => {
      window.open(`${baseUrl}/orders/${orderId}/labels-pdf`, "_blank");
   };
   const handlePrintHbl = () => {
      window.open(`${baseUrl}/orders/${orderId}/hbls-pdf`, "_blank");
   };

   if (isLoading)
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <CogIcon size={40} className="animate-spin" />
               </EmptyMedia>
               <EmptyTitle>Loading Order</EmptyTitle>
               <EmptyDescription>Please wait while we load the order.</EmptyDescription>
            </EmptyHeader>
         </Empty>
      );

   if (error || !order)
      return (
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <FileWarning />
               </EmptyMedia>
               <EmptyTitle>Order Not Found</EmptyTitle>
               <EmptyDescription>The order you are looking for does not exist.</EmptyDescription>
            </EmptyHeader>
         </Empty>
      );

   return order ? (
      <div className="space-y-4 container max-w-screen-xl mx-auto">
         <div className="flex flex-col container mx-auto gap-2 md:flex-row lg:justify-between lg:items-center print:hidden">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                     {order?.service.service_type === "MARITIME" ? (
                        <Ship size={24} className="text-blue-500" />
                     ) : (
                        <Plane size={24} className="text-blue-500" />
                     )}
                     <Separator orientation="vertical" className="min-h-6 mx-2" />

                     <div>
                        <div>
                           <span className="text-sm mr-2">{order?.service?.provider?.name}</span>
                           <Badge
                              variant={order?.status === "pending" ? "default" : "outline"}
                              className="print:hidden"
                           >
                              {order?.status}
                           </Badge>
                        </div>
                        <div className="flex  gap-2">
                           <span className="text-sm text-muted-foreground">Facturado por:</span>
                           <span className="text-sm"> {order?.user?.name}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <ButtonGroup orientation="horizontal" className="mx-auto md:mx-0">
               <Button onClick={handlePrintOrder} variant="outline">
                  <PrinterIcon className=" h-4 w-4" />
                  Order
               </Button>

               <Button onClick={handlePrintLabels} variant="outline">
                  <TagIcon className=" h-4 w-4" />
                  Labels
               </Button>
               <Button onClick={handlePrintHbl} variant="outline">
                  <FileTextIcon className=" h-4 w-4" />
                  HBL
               </Button>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="outline" size="icon" aria-label="More Options">
                        <EllipsisVerticalIcon />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                     <DropdownMenuGroup>
                        <DropdownMenuItem>
                           <Edit2Icon />
                           Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                           <ArchiveIcon />
                           Archive
                        </DropdownMenuItem>
                     </DropdownMenuGroup>
                     <DropdownMenuSeparator />
                     <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                           <DeleteOrderDialog order_id={Number(orderId)} asRedirect={true} />
                        </DropdownMenuItem>
                     </DropdownMenuGroup>
                  </DropdownMenuContent>
               </DropdownMenu>
            </ButtonGroup>
         </div>
         <Card className="p-4 container mx-auto print:shadow-none bg-card print:bg-white print:py-0 print:text-gray-500">
            <div className="flex flex-col xl:flex-row justify-between items-start ">
               <div className="flex items-center gap-4">
                  {order?.agency?.logo ? (
                     <img
                        src={order?.agency?.logo}
                        alt={order?.agency?.name}
                        className="w-20 h-20  p-2 object-center object-scale-down rounded-full  border"
                     />
                  ) : (
                     <div className=" bg-muted min-h-20 min-w-20 object-cover rounded-full border"></div>
                  )}

                  <div>
                     <h1 className="text-xl  font-bold "> {order?.agency?.name}</h1>
                     <p className="text-sm text-muted-foreground">Address: {order?.agency?.address}</p>
                     <p className="text-sm text-muted-foreground">Phone: {order?.agency?.phone}</p>
                  </div>
               </div>

               <div className=" flex w-full flex-col  justify-end text-center xl:text-end">
                  <h1 className="xl:text-xl text-end font-bold ">Order {order?.id}</h1>
                  <div className="flex items-center gap-2 text-end justify-end">
                     <span className="xl:text-lg text-end">{total_weight?.toFixed(2)} lbs</span>
                     <span className="xl:text-lg text-end">Items: {order?.items?.length || 0}</span>
                  </div>
                  <time className="text-sm text-end text-muted-foreground">
                     Fecha: {format(new Date(order?.created_at), "dd/MM/yyyy HH:mm a")}
                  </time>
               </div>
            </div>
            <div className="grid grid-cols-1 text-sm font-light  xl:grid-cols-2 items-start justify-between gap-10 xl:gap-20 mb-4 xl:mb-8">
               <ul className="grid gap-3 ">
                  <li className="flex items-center gap-2 justify-start">
                     <span className="text-muted-foreground">
                        <User size={16} />
                     </span>
                     <span>
                        {formatFullName(
                           order?.customer?.first_name,
                           order?.customer?.middle_name,
                           order?.customer?.last_name,
                           order?.customer?.second_last_name
                        )}
                     </span>
                  </li>
                  <li className="flex items-center gap-2 justify-start">
                     <span className="text-muted-foreground">
                        <Phone size={16} />
                     </span>
                     <span>{order?.customer?.mobile}</span>
                  </li>
                  <li className="flex items-center gap-2 justify-start">
                     <span className="text-muted-foreground">
                        <MapPin size={16} />
                     </span>
                     <span>{order?.customer?.address}</span>
                  </li>
               </ul>

               <ul className="grid gap-3  ">
                  <li className="flex items-center gap-2 justify-start">
                     <span className="text-muted-foreground">
                        <User size={16} />
                     </span>
                     <span>
                        {formatFullName(
                           order?.receiver?.first_name,
                           order?.receiver?.middle_name,
                           order?.receiver?.last_name,
                           order?.receiver?.second_last_name
                        )}
                     </span>
                  </li>
                  <li className="flex items-center gap-2 justify-start">
                     <span className="text-muted-foreground">
                        <Phone size={16} />
                     </span>
                     <span>{order?.receiver?.phone || order?.receiver?.mobile}</span>
                  </li>
                  <li className="flex items-center gap-2 justify-start">
                     <span className="text-muted-foreground">
                        <MapPin size={16} />
                     </span>
                     <span>{order?.receiver?.address}</span>
                  </li>
               </ul>
            </div>

            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className="w-20 text-muted-foreground">HBL</TableHead>
                     <TableHead className="w-full text-muted-foreground">Descripción</TableHead>
                     <TableHead className="text-right w-14 text-muted-foreground">Seguro</TableHead>
                     <TableHead className="text-right w-14 text-muted-foreground">Cargo</TableHead>
                     <TableHead className="text-right w-14 text-muted-foreground">Arancel</TableHead>
                     <TableHead className="text-right w-14 text-muted-foreground">Rate</TableHead>
                     <TableHead className="text-right w-14 text-muted-foreground">Peso</TableHead>
                     <TableHead className="text-right w-14 text-muted-foreground">Subtotal</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {order?.order_items.map((item: OrderItems, index: number) => (
                     <TableRow key={index}>
                        <TableCell className="">{item?.hbl}</TableCell>
                        <TableCell className="">{item?.description}</TableCell>
                        <TableCell
                           className={`text-right ${item?.insurance_fee_in_cents === 0 ? "text-muted-foreground" : ""}`}
                        >
                           {formatCents(item?.insurance_fee_in_cents)}
                        </TableCell>
                        <TableCell
                           className={`text-right ${item?.charge_fee_in_cents === 0 ? "text-muted-foreground" : ""} ${
                              item?.charge_fee_in_cents === 0 ? "text-muted-foreground" : ""
                           }`}
                        >
                           {formatCents(item?.charge_fee_in_cents)}
                        </TableCell>
                        <TableCell
                           className={`text-right ${item?.customs_fee_in_cents === 0 ? "text-muted-foreground" : ""}`}
                        >
                           {formatCents(item?.customs_fee_in_cents)}
                        </TableCell>
                        <TableCell
                           className={`text-right ${item?.price_in_cents === 0 ? "text-muted-foreground" : ""}`}
                        >
                           {formatCents(item?.price_in_cents)}
                        </TableCell>
                        <TableCell className="text-right">{Number(item?.weight)}</TableCell>
                        <TableCell className="text-right">
                           {formatCents(
                              calculate_row_subtotal(
                                 item?.price_in_cents,
                                 item?.weight,
                                 item?.customs_fee_in_cents,
                                 item?.charge_fee_in_cents,
                                 item?.insurance_fee_in_cents,
                                 item?.unit
                              )
                           )}
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
            <div className="relative">
               <div className="absolute p-4 inset-0 flex items-center justify-center pointer-events-none">
                  <span
                     className={`xl:text-[90px] text-4xl rounded-2xl p-4 border font-extrabold  opacity-10 rotate-[-30deg]  ${
                        order?.payment_status === "PAID"
                           ? "text-green-500 bg-green-500/10 border-green-500"
                           : order?.payment_status === "PARTIALLY_PAID"
                           ? "text-yellow-500 bg-yellow-500/10 border-yellow-500"
                           : "text-red-500 bg-red-500/10 border-red-500"
                     }`}
                  >
                     {order?.payment_status}
                  </span>
               </div>
               <div className="flex w-full  justify-end  ">
                  <ul className="flex flex-col w-full p-2 lg:w-1/3 justify-end gap-2 border-t border-dashed  ">
                     <li className="flex items-center gap-4 justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCents(subtotal) ?? 0.0}</span>
                     </li>

                     <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>
                           {formatCents(
                              order?.order_items.reduce(
                                 (acc: number, item: OrderItems) => acc + item?.delivery_fee_in_cents || 0,
                                 0
                              )
                           ) ?? 0.0}
                        </span>
                     </li>
                     <DiscountsDetails discounts={order?.discounts ?? []} order_id={Number(order?.id)} />

                     <li className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                           Payment Fee
                           <CreditCard className="size-4" />
                        </span>
                        <span>
                           {formatCents(
                              order?.payments.reduce(
                                 (acc: number, payment: Payment) => acc + (payment?.charge_in_cents ?? 0),
                                 0
                              )
                           ) ?? 0.0}
                        </span>
                     </li>

                     <li className="flex items-center justify-between font-semibold">
                        <span className="text-muted-foreground">Total</span>
                        <span>{formatCents(order?.total_in_cents)}</span>
                     </li>
                     <Separator />
                     <PaymentsDetails order={order} />

                     <li className="flex text-sm items-center justify-between">
                        <span className="text-muted-foreground">Balance</span>
                        <span
                           className={cn(
                              order?.payment_status !== "PAID" ? "text-red-500/60" : "text-muted-foreground"
                           )}
                        >
                           {formatCents(order?.total_in_cents - order?.paid_in_cents) ?? 0.0}
                        </span>
                     </li>
                  </ul>
               </div>
            </div>
            <Separator className="print:hidden" />
            <div className="print:hidden mx-auto w-full xl:w-1/6">
               {order?.payment_status === "PENDING" || order?.payment_status === "PARTIALLY_PAID" ? (
                  <PaymentForm order={order} />
               ) : null}
            </div>
            <div className=" text-center text-gray-500 text-xs">
               <p>{order?.agency?.website}</p>
               <p>Thank you for your business!</p>
               <p>Payment is due within 30 days. Please process this invoice within that time.</p>
            </div>
         </Card>
      </div>
   ) : (
      <OrderNotFound />
   );
}
