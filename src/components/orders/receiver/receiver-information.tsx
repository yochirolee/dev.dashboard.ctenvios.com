import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import { formatFullName } from "@/lib/cents-utils";
import { Separator } from "@/components/ui/separator";

export function ReceiverInformation() {
   const { selectedReceiver, setSelectedReceiver } = useInvoiceStore(
      useShallow((state) => ({
         selectedReceiver: state.selectedReceiver,
         setSelectedReceiver: state.setSelectedReceiver,
      }))
   );

   const fullName = formatFullName(
      selectedReceiver?.first_name,
      selectedReceiver?.middle_name,
      selectedReceiver?.last_name,
      selectedReceiver?.second_last_name
   );

   return (
      <>
         {selectedReceiver && (
            <div className="grid gap-3 mt-2 text-sm p-4 bg-muted rounded-lg">
               <div className="flex items-center justify-between">
                  <div className="">Datos del Destinatario</div>
                  <Button
                     variant="outline"
                     onClick={() => {
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
                     <dt className="text-muted-foreground">Carne de Identidad</dt>
                     <dd>{selectedReceiver?.ci}</dd>
                  </div>

                  <div className="flex items-center justify-between">
                     <dt className="text-muted-foreground">Movil/Telefono</dt>
                     <dd>
                        <a href={`tel:${selectedReceiver?.mobile}`}>{selectedReceiver?.mobile}</a>{" "}
                        {selectedReceiver?.phone && (
                           <>
                              <span className="text-muted-foreground">/ </span>
                              <a href={`tel:${selectedReceiver?.phone}`}>{selectedReceiver?.phone}</a>
                           </>
                        )}
                     </dd>
                  </div>
                  <div className="flex items-center justify-between">
                     <dt className="text-muted-foreground">Dirección</dt>
                     <div className="flex flex-col items-end  gap-2">
                        <dd className="text-sm text-right">{selectedReceiver?.address}</dd>

                        <Badge variant="outline">
                           {typeof selectedReceiver?.province === "object"
                              ? (selectedReceiver?.province as any)?.name
                              : selectedReceiver?.province}{" "}
                           /{" "}
                           {typeof selectedReceiver?.city === "object"
                              ? (selectedReceiver?.city as any)?.name
                              : selectedReceiver?.city}
                        </Badge>
                     </div>
                  </div>
               </dl>
            </div>
         )}
      </>
   );
}
