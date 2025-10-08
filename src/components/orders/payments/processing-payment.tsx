import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

export function PaymentProcessing({ amount, charge }: { amount: number, charge: number }) {
   
   const total = amount + charge;
   return (
      <div className="flex w-full flex-col gap-4 [--radius:1rem]">
         <Item variant="muted">
            <ItemMedia>
               <Spinner />
            </ItemMedia>
            <ItemContent>
               <ItemTitle className="line-clamp-1">Processing payment...</ItemTitle>
            </ItemContent>
            <ItemContent className="flex-none justify-end">
               <span className="text-sm tabular-nums">${total.toFixed(2)}</span>
            </ItemContent>
         </Item>
      </div>
   );
}
