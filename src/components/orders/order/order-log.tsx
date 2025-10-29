import { Copy, User } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useInvoices } from "@/hooks/use-orders";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderLog({ invoiceId }: { invoiceId: number }) {
   const { data: events, isLoading } = useInvoices.getHistory(invoiceId);
   if (isLoading) return;
   <div className="col-span-1 xl:col-span-3 h-full">
      <Skeleton />
   </div>;
   console.log(events, "events");

   return (
      <Card className=" col-span-1 xl:col-span-3 px-4 py-2">
         <div className="grid gap-0.5">
            <CardTitle className="group flex justify-between items-center gap-2 text-lg">
               Order No. {invoiceId}
               <Button size="icon" variant="outline" className="h-6 w-6 transition-opacity group-hover:opacity-100">
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy Order ID</span>
               </Button>
            </CardTitle>
            <CardDescription>Order History</CardDescription>
         </div>

         <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-0 w-[1px] bg-border" />

            {events?.map((event: any) => (
               <div key={event.id} className="relative pl-8">
                  {/* Timeline dot */}
                  <div className={`absolute left-1 top-1 h-2 w-2 rounded-full bg-muted-foreground/50`} />

                  <div className="space-y-1">
                     <div className="flex items-center gap-2 text-xs text-muted-foreground justify-between">
                        <Badge variant="secondary" className={`text-[10px] font-semibold `}>
                           {event.status}
                        </Badge>
                        <time className="text-xs">{format(new Date(event.created_at), "dd/MM/yyyy HH:mm a")}</time>
                     </div>

                     <h3 className="font-sans text-xs font-semibold text-foreground">{event.comment}</h3>

                     <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {event.user.name}
                     </p>
                  </div>
               </div>
            ))}
         </div>

         <div className="mt-2">
            <Textarea
               placeholder="Add an internal note (not visible to customer)"
               className="min-h-[80px] resize-none text-sm"
            />
         </div>
      </Card>
   );
}
