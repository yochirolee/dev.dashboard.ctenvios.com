import type { Service } from "@/data/types";
import { Card, CardHeader } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Switch } from "../../ui/switch";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ServiceCardActions } from "./service-card-actions";
import { useServices } from "@/hooks/use-services";
import { toast } from "sonner";

export const ServiceCard = ({ service }: { service: Service }) => {
   const { mutate: updateService } = useServices.update({
      onSuccess: () => {
         toast.success("Servicio actualizado correctamente");
      },
      onError: (error) => {
         toast.error(error.message);
      },
   });
   const handleUpdateService = () => {
      updateService({
         id: service?.id ?? 0,
         data: {
            ...service,
            is_active: !service?.is_active
         },
      });
   };
   return (
      <Card key={service?.id} className="flex flex-col mb-4">
         <CardHeader className="flex  justify-between items-center">
            <Field>
               <FieldContent>
                  <FieldLabel>
                     <h1 className="text-lg font-bold">{service?.name}</h1>
                     <Badge variant="outline">{service?.service_type}</Badge>
                  </FieldLabel>
                  <div className="flex justify-between items-center gap-2">
                     <FieldDescription>{service?.description}</FieldDescription>
                     <div className="flex items-center gap-2">
                        <Switch
                           checked={service?.is_active}
                           onCheckedChange={handleUpdateService}
                        />
                        <ServiceCardActions />
                     </div>
                  </div>
               </FieldContent>
            </Field>
         </CardHeader>
      </Card>
   );
};
