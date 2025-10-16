import type { Payment } from "@/data/types";
import { formatCents } from "@/lib/cents-utils";
import { CreditCard, Trash2 } from "lucide-react";
import { Item, ItemMedia, ItemContent, ItemActions, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useInvoices } from "@/hooks/use-invoices";
import { InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";

export const PaymentsDetails = ({ payments }: { payments: Payment[] }) => {
   return (
      <div className="flex flex-col gap-2  rounded-md py-2  ">
         <h3 className="text-sm font-medium">Pagos</h3>
         {payments.map((payment: Payment) => (
            <PaymentItem payment={payment} key={payment?.id} />
         ))}
      </div>
   );
};

const PaymentItem = ({ payment }: { payment: Payment }) => {
   const { mutate: deletePayment, isPending: isDeleting } = useInvoices.deletePayment({
      onSuccess: () => {
         toast.success("Payment deleted successfully");
      },
      onError: (error: any) => {
         toast.error(error.response.data.message);
      },
   });
   return (
      <Item variant="outline" size="sm" key={payment?.id}>
         <ItemMedia>
            <CreditCard className="size-5" />
         </ItemMedia>
         <ItemContent>
            <ItemTitle className="text-muted-foreground text-sm font-normal">
               <span>{formatCents(payment?.amount_in_cents + (payment?.charge_in_cents ?? 0))}</span>
               <span>{isDeleting ? "Deleting..." : "Pagado"}</span>
            </ItemTitle>
         </ItemContent>
         <ItemActions>
            {isDeleting ? (
               <Spinner className="size-4 text-muted-foreground" />
            ) : (
               <InputGroupAddon align="inline-end">
                  <InputGroupButton variant="secondary" size="icon-xs" onClick={() => deletePayment(payment?.id ?? 0)}>
                     <Trash2 />
                  </InputGroupButton>
               </InputGroupAddon>
            )}
         </ItemActions>
      </Item>
   );
};
