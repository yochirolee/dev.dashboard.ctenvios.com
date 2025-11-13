import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { formatCents } from "@/lib/cents-utils";
import type { Discount } from "@/data/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DiscountDialog } from "./discount-dialog";
import { DiscountItem } from "./discount-item";

export function DiscountsDetails({ discounts, order_id }: { discounts: Discount[]; order_id: number }) {
   const totalDiscount = discounts.reduce((acc, discount) => acc + discount.discount_in_cents, 0);
   const [open, setOpen] = useState(false);
   return (
      <div className="flex items-center gap-2">
         <Collapsible className="w-full" open={open} onOpenChange={setOpen}>
            <div className="flex items-center gap-2 justify-between">
               <div className="flex items-center gap-2">
                  <CollapsibleTrigger onClick={() => setOpen(!open)}>
                     <div className="inline-flex items-center gap-2">
                        <span className="text-muted-foreground">Descuentos</span>

                        {open ? (
                           <ChevronUpIcon className="size-4 text-muted-foreground" />
                        ) : (
                           <ChevronDownIcon className="size-4 text-muted-foreground" />
                        )}
                     </div>
                  </CollapsibleTrigger>
                  <DiscountDialog order_id={order_id} />
               </div>

               <span className="text-muted-foreground">
                  {totalDiscount > 0 ? "-" : ""} {formatCents(totalDiscount)}
               </span>
            </div>
            <CollapsibleContent>
               {discounts.map((discount: Discount) => (
                  <DiscountItem discount={discount} key={discount?.id} />
               ))}
            </CollapsibleContent>
         </Collapsible>
      </div>
   );
}
