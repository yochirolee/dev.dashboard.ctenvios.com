import { useOrderStore } from "@/stores/order-store";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatFullName } from "@/lib/cents-utils";

export function CustomerInformation() {
   const { selectedCustomer, setSelectedCustomer, setSelectedReceiver } = useOrderStore(
      useShallow((state) => ({
         selectedCustomer: state.selectedCustomer,
         setSelectedCustomer: state.setSelectedCustomer,
         setSelectedReceiver: state.setSelectedReceiver,
      }))
   );

   const fullName = formatFullName(
      selectedCustomer?.first_name,
      selectedCustomer?.middle_name,
      selectedCustomer?.last_name,
      selectedCustomer?.second_last_name
   );

   return (
      <>
         {selectedCustomer && (
            <div className="grid gap-3 mt-2 text-sm p-4 bg-muted rounded-lg">
               <div className="flex items-center justify-between">
                  <div className="">Datos del cliente</div>
                  <Button
                     variant="outline"
                     onClick={() => {
                        setSelectedCustomer(null);
                        setSelectedReceiver(null);
                     }}
                  >
                     Cancelar
                  </Button>
               </div>
               <Separator orientation="horizontal" />
               <dl className="grid gap-3">
                  <div className="flex items-center justify-between">
                     <dt className="text-muted-foreground">Nombre</dt>
                     <dd>{fullName}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                     <dt className="text-muted-foreground">Email</dt>
                     <dd>
                        <a href={`mailto:${selectedCustomer?.email}`}>{selectedCustomer?.email}</a>
                     </dd>
                  </div>
                  <div className="flex items-center justify-between">
                     <dt className="text-muted-foreground">Movil/Telefono</dt>
                     <dd>
                        <a href={`tel:${selectedCustomer?.mobile}`}>{selectedCustomer?.mobile}</a>
                        <a href={`tel:${selectedCustomer?.phone}`}>{selectedCustomer?.phone}</a>
                     </dd>
                  </div>
                  <div className="flex items-center justify-between">
                     <dt className="text-muted-foreground">Identificación</dt>
                     <dd>
                        <a href={`tel:${selectedCustomer?.identity_document}`}>{selectedCustomer?.identity_document}</a>
                     </dd>
                  </div>
                  <div className="flex items-center justify-between">
                     <dt className="text-muted-foreground">Dirección</dt>
                     <dd>{selectedCustomer?.address}</dd>
                  </div>
               </dl>
            </div>
         )}
      </>
   );
}
