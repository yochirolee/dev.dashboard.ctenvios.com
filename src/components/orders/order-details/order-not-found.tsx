import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { FileWarning } from "lucide-react";
import { useNavigate } from "react-router";

export function OrderNotFound() {
   const navigate = useNavigate();
   return (
      <Empty>
         <EmptyHeader>
            <EmptyMedia variant="icon">
               <FileWarning />
            </EmptyMedia>
            <EmptyTitle>No Order Found!</EmptyTitle>
            <EmptyDescription> The order you are looking for does not exist.</EmptyDescription>
         </EmptyHeader>
         <EmptyContent className="grid grid-cols-2 gap-2">
            <Button onClick={() => navigate("/orders")} variant="outline" size="sm">
               Go to Orders
            </Button>
            <Button onClick={() => navigate("/orders/new")} variant="default" size="sm">
               Create Order
            </Button>
         </EmptyContent>
      </Empty>
   );
}
