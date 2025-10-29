import type { Payment } from "@/data/types";
import { formatCents } from "@/lib/cents-utils";
import { CreditCard, Trash2, Banknote, CreditCardIcon } from "lucide-react";
import { Item, ItemMedia, ItemContent, ItemActions, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useOrders } from "@/hooks/use-orders";
import { InputGroupAddon } from "@/components/ui/input-group";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import zelleIcon from "/zelle-icon.svg";

const paymentIcons = {
   CASH: <Banknote className="size-4" />,
   CREDIT_CARD: <CreditCard className="size-4" />,
   DEBIT_CARD: <CreditCard className="size-4" />,
   TRANSFER: <Banknote className="size-4" />,
   ZELLE: <img src={zelleIcon} alt="Zelle" className="size-4" />,
   PAYPAL: <CreditCardIcon className="size-4" />,
   OTHER: <CreditCardIcon className="size-4" />,
};

export const PaymentsDetails = ({ payments }: { payments: Payment[] }) => {
   return (
      <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
         <AccordionItem value="payments">
            <AccordionTrigger>
               <div className="flex items-center  gap-2">
                  <span>Pagos</span>
                  <span className=" rounded-full bg-muted-foreground/10 text-muted-foreground font-extralight text-[11px] h-4 w-4 flex items-center justify-center">
                     {payments?.length ?? 0}
                  </span>
               </div>
            </AccordionTrigger>

            <AccordionContent className="flex flex-col gap-4 text-balance">
               {payments.map((payment: Payment) => (
                  <PaymentItem payment={payment} key={payment?.id} />
               ))}
            </AccordionContent>
         </AccordionItem>
      </Accordion>
   );
};

const PaymentItem = ({ payment }: { payment: Payment }) => {
   const { mutate: deletePayment, isPending: isDeleting } = useOrders.deletePayment({
      onSuccess: () => {
         toast.success("Payment deleted successfully");
      },
      onError: (error: any) => {
         toast.error(error.response.data.message);
      },
   });
   return (
      <Item variant="outline" size="sm" key={payment?.id}>
         <ItemMedia>{paymentIcons[payment?.method as keyof typeof paymentIcons]}</ItemMedia>
         <ItemContent>
            <ItemTitle className="text-muted-foreground text-sm font-light">
               <span>{formatCents(payment?.amount_in_cents + (payment?.charge_in_cents ?? 0))}</span>
               <span>{isDeleting ? "Deleting..." : "Pagado"}</span>
            </ItemTitle>
         </ItemContent>
         <ItemActions>
            {isDeleting ? (
               <Spinner className="size-4 text-muted-foreground" />
            ) : (
               <InputGroupAddon align="inline-end">
                  <Trash2 className="size-4" onClick={() => deletePayment(payment?.id ?? 0)} />
               </InputGroupAddon>
            )}
         </ItemActions>
      </Item>
   );
};
