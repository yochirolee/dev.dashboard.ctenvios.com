import type { Service } from "@/data/types";
import { Card, CardHeader } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Switch } from "../../ui/switch";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ServiceCardActions } from "./service-card-actions";

export const ServiceCard = ({ service }: { service: Service }) => {
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
                           onCheckedChange={() => {
                              console.log("checked");
                           }}
                           
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
