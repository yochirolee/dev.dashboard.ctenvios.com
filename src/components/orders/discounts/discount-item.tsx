import { useOrders } from "@/hooks/use-orders";
import { toast } from "sonner";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { InputGroupAddon } from "@/components/ui/input-group";
import { formatCents } from "@/lib/cents-utils";
import type { Discount } from "@/data/types";
import { BanknoteIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Trash2 } from "lucide-react";

const discountMethods = {
   CASH: "Efectivo",
   PERCENT: "Porcentaje",
   RATE: "Tarifa",
};
export const DiscountItem = ({ discount }: { discount: Discount }) => {
   const { mutate: deleteDiscount, isPending: isDeleting } = useOrders.deleteDiscount({
      onSuccess: () => {
         toast.success("Discount deleted successfully");
      },
      onError: (error: any) => {
         console.log("error", error);
         toast.error(error.response.data.message);
      },
   });

   return (
      <Item size="sm" variant="muted" className="py-0 pr-0 my-2" key={discount?.id}>
         <ItemMedia>
            <BanknoteIcon className="size-4" />
         </ItemMedia>
         <ItemContent>
            <ItemTitle className="text-muted-foreground text-sm font-light">
               <span>
                  {isDeleting ? (
                     "Deleting..."
                  ) : (
                     <div>
                        {discountMethods[discount?.type as keyof typeof discountMethods]}
                        {discount?.rate ? " " + formatCents(discount.rate ?? 0) : ""}
                     </div>
                  )}
               </span>
            </ItemTitle>
         </ItemContent>
         <ItemActions>
            <span className="text-muted-foreground text-sm font-light">{formatCents(discount?.discount_in_cents)}</span>
            {isDeleting ? (
               <InputGroupAddon align="inline-end">
                  <Spinner className="size-4 h-4 w-4 text-muted-foreground" />
               </InputGroupAddon>
            ) : (
               <InputGroupAddon align="inline-end" className="mr-0">
                  <Trash2 size="4" className="cursor-pointer" onClick={() => deleteDiscount(discount?.id ?? 0)} />
               </InputGroupAddon>
            )}
         </ItemActions>
      </Item>
   );
};
