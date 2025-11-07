import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useOrderStore } from "@/stores/order-store";
import { useShallow } from "zustand/react/shallow";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plane, Ship } from "lucide-react";
import type { Service, ShippingRate, Provider } from "@/data/types";
import { Field, FieldDescription, FieldLabel, FieldTitle, FieldContent } from "../ui/field";
import { ItemMedia } from "../ui/item";

// Extended Service interface to match API response
interface ServiceWithRates extends Service {
   shipping_rates: ShippingRate[];
   provider: Provider;
}

export function ServiceSelector({ services }: { services: ServiceWithRates[] }) {
   const { setSelectedService, selectedService, selectedCustomer, selectedReceiver } = useOrderStore(
      useShallow((state) => ({
         setSelectedService: state.setSelectedService,
         selectedService: state.selectedService,
         selectedCustomer: state.selectedCustomer,
         selectedReceiver: state.selectedReceiver,
      }))
   );

   const isDisabled = !selectedCustomer || !selectedReceiver;

   const handleServiceChange = (serviceId: string) => {
      const service = services?.find((s: ServiceWithRates) => s.id?.toString() === serviceId);
      if (service) {
         setSelectedService(service as ServiceWithRates);
      }
   };

   return (
      <Card>
         <CardHeader>
            <CardTitle>Seleccionar Servicio Tarifa</CardTitle>
            <CardDescription>Selecciona el servicio y tarifa que deseas usar en tu orden.</CardDescription>
         </CardHeader>
         <CardContent className="flex flex-col gap-4">
            <RadioGroup
               value={selectedService?.id?.toString() || ""}
               onValueChange={handleServiceChange}
               className="grid grid-cols-1 md:grid-cols-6 gap-2"
               disabled={isDisabled}
            >
               {services?.map((service: ServiceWithRates) =>
                  service.shipping_rates?.length === 0 ? null : (
                     <FieldLabel key={service.id} htmlFor={`${service.id?.toString()}`}>
                        <Field orientation="horizontal">
                           <ItemMedia variant="default">
                              {service.service_type === "AIR" ? (
                                 <Plane className="size-6" />
                              ) : (
                                 <Ship className="size-6" />
                              )}
                           </ItemMedia>
                           <FieldContent className="flex flex-col gap-2">
                              <FieldTitle>{service.provider.name}</FieldTitle>
                              <FieldDescription className="text-muted-foreground text-xs font-light">
                                 {service.name}
                              </FieldDescription>
                           </FieldContent>
                           <RadioGroupItem
                              value={service.id?.toString() || ""}
                              id={service.id?.toString() || ""}
                              className="mt-0.5"
                           />
                        </Field>
                     </FieldLabel>
                  )
               )}
            </RadioGroup>
         </CardContent>
      </Card>
   );
}
