import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/use-orders";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Undo2 } from "lucide-react";

export function RestoreOrderButton({ order_id }: { order_id: number }): React.ReactNode {
   const { mutate: restoreOrder, isPending: isRestoringOrder } = useOrders.restore({
      onSuccess: () => {
         toast.success("Orden restaurada correctamente");
      },
      onError: (error: any) => {
         toast.error(error?.response?.data?.message || "Error al restaurar la orden");
      },
   });

   const handleRestore = (): void => {
      restoreOrder({ order_id });
   };

   return (
      <Button
         variant="ghost"
         className="w-full flex justify-start items-center gap-2 px-2 py-1.5 h-auto font-normal"
         onClick={handleRestore}
         disabled={isRestoringOrder}
      >
         {isRestoringOrder ? <Spinner className="size-4" /> : <Undo2 className="size-4" />}
         Restaurar
      </Button>
   );
}
