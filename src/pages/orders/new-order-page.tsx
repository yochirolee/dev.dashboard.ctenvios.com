import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerCombobox } from "@/components/orders/customer/customer-combobox";
import { ServiceSelector } from "@/components/orders/service-selector";
import { ReceiverCombobox } from "@/components/orders/receiver/receiver-combobox";
import { CustomerInformation } from "@/components/orders/customer/customer-information";
import { ReceiverInformation } from "@/components/orders/receiver/receiver-information";
import { ReceiverFormDialog } from "@/components/orders/receiver/receiver-form-dialog";
import { CustomerFormDialog } from "@/components/orders/customer/customer-form-dialog";
import { ItemsInOrder } from "@/components/orders/items-in-order";
import { useShallow } from "zustand/react/shallow";
import { useOrderStore } from "@/stores/order-store";
import { useAppStore } from "@/stores/app-store";
import { useAgencies } from "@/hooks/use-agencies";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrefetch } from "@/hooks/use-prefetch";

export function NewOrderPage() {
   usePrefetch.customsRates(0, 300);
   const { selectedCustomer, selectedReceiver, selectedService } = useOrderStore(
      useShallow((state) => ({
         selectedCustomer: state.selectedCustomer,
         selectedReceiver: state.selectedReceiver,
         setSelectedCustomer: state.setSelectedCustomer,
         setSelectedReceiver: state.setSelectedReceiver,
         selectedService: state.selectedService,
      }))
   );
   const user = useAppStore((state) => state.user || null);
   const agencyId = user?.agency_id || 0;

   const { data: services, isLoading: isLoadingServices } = useAgencies.getServices(agencyId);
   const { data: shipping_rates } = useAgencies.getShippingRates(agencyId, selectedService?.id || 0);
   if (shipping_rates) {
      useOrderStore.setState({ shipping_rates: shipping_rates });
   }

   return (
      <div className="space-y-4 ">
         <div className="flex flex-col">
            <h3 className=" font-bold">Crear Orden</h3>
            <p className="text-sm text-gray-500 ">Orden de Envio, Destinatario, Servicio</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
               <CardHeader>
                  <CardTitle>Cliente</CardTitle>
               </CardHeader>
               <CardContent className="flex flex-col  gap-2">
                  <div className="flex flex-col lg:flex-row gap-2">
                     <CustomerCombobox />
                     <CustomerFormDialog />
                  </div>

                  <CustomerInformation />
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Destinatario</CardTitle>
               </CardHeader>
               <CardContent className="flex flex-col gap-2">
                  <div className="flex flex-col lg:flex-row gap-2">
                     <ReceiverCombobox />
                     <ReceiverFormDialog />
                  </div>
                  <ReceiverInformation />
               </CardContent>
            </Card>
         </div>
         {selectedCustomer && selectedReceiver && (
            <>
               {isLoadingServices ? (
                  <Skeleton />
               ) : (
                  <>
                     <ServiceSelector services={services || []} />
                     {selectedService && <ItemsInOrder />}
                  </>
               )}
            </>
         )}
      </div>
   );
}
