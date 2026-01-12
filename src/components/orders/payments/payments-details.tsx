import { useState } from "react";
import type { Order, Payment } from "@/data/types";
import { formatCents } from "@/lib/cents-utils";
import { CreditCard, Trash2, Banknote, CreditCardIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Item, ItemMedia, ItemContent, ItemActions, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useOrders } from "@/hooks/use-orders";
import { InputGroupAddon } from "@/components/ui/input-group";
import zelleIcon from "/zelle-icon.svg";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const paymentIcons = {
   CASH: <Banknote className="size-4" />,
   CREDIT_CARD: <CreditCard className="size-4" />,
   DEBIT_CARD: <CreditCard className="size-4" />,
   TRANSFER: <Banknote className="size-4" />,
   ZELLE: <img src={zelleIcon} alt="Zelle" className="size-4" />,
   PAYPAL: <CreditCardIcon className="size-4" />,
   OTHER: <CreditCardIcon className="size-4" />,
};

export const PaymentsDetails = ({ order }: { order: Order & { payments: Payment[] } }) => {
   const [open, setOpen] = useState(false);

   return (
      <Collapsible className="w-full" open={open} onOpenChange={setOpen}>
         <div className="flex items-center gap-2 justify-between">
            <CollapsibleTrigger>
               <div className="inline-flex items-center gap-2">
                  <span className="text-muted-foreground">Pagos</span>

                  {open ? (
                     <ChevronUpIcon className="size-4 text-muted-foreground" />
                  ) : (
                     <ChevronDownIcon className="size-4 text-muted-foreground" />
                  )}
               </div>
            </CollapsibleTrigger>
            <span
               className={cn(
                  "text-green-500/80",
                  order?.paid_in_cents !== order?.total_in_cents ? "text-muted-foreground" : ""
               )}
            >
               {formatCents(order?.paid_in_cents)}
            </span>
         </div>

         <CollapsibleContent className="flex flex-col gap-4 text-balance">
            {order?.payments?.map((payment: Payment) => (
               <PaymentItem payment={payment} key={payment?.id} />
            ))}
         </CollapsibleContent>
      </Collapsible>
   );
};

const paymentMethods = {
   CASH: "Efectivo",
   CREDIT_CARD: "Tarjeta de Crédito",
   DEBIT_CARD: "Tarjeta de Débito",
   TRANSFER: "Transferencia",
   ZELLE: "Zelle",
   PAYPAL: "Paypal",
};
const PaymentItem = ({ payment }: { payment: Payment }) => {
   const { mutate: deletePayment, isPending: isDeleting } = useOrders.deletePayment({
      onSuccess: () => {
         toast.success("Payment deleted successfully");
      },
      onError: (error: any) => {
         const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete payment";
         toast.error(errorMessage);
      },
   });
   return (
      <Item size="sm" variant="muted" className="py-0 pr-0 my-2" key={payment?.id}>
         <ItemMedia>{paymentIcons[payment?.method as keyof typeof paymentIcons]}</ItemMedia>
         <ItemContent>
            <ItemTitle className="text-muted-foreground text-sm font-light">
               <span>
                  {isDeleting ? "Deleting..." : paymentMethods[payment?.method as keyof typeof paymentMethods]}
               </span>
            </ItemTitle>
         </ItemContent>
         <ItemActions>
            {formatCents(payment?.amount_in_cents + (payment?.charge_in_cents ?? 0))}

            {isDeleting ? (
               <InputGroupAddon align="inline-end">
                  <Spinner className="size-4 h-4 w-4 text-muted-foreground" />
               </InputGroupAddon>
            ) : (
               <InputGroupAddon align="inline-end">
                  <div className="text-muted-foreground text-xs font-light mr-2">
                     {format(new Date(payment?.created_at ?? ""), "dd/MM/yyyy HH:mm a")}
                  </div>
                  <Trash2 size="4" className="cursor-pointer" onClick={() => deletePayment(payment?.id ?? 0)} />
               </InputGroupAddon>
            )}
         </ItemActions>
      </Item>
   );
};
