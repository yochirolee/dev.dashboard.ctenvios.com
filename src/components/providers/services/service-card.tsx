import { useState } from "react";
import type { Product, Service } from "@/data/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Switch } from "../../ui/switch";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ServiceCardActions } from "./service-card-actions";
import { useServices } from "@/hooks/use-services";
import { toast } from "sonner";
import { ProductList } from "../products/product-list";
import { Separator } from "../../ui/separator";
import { CreateProductForm } from "../products/create-product-form";

interface ServiceWithProducts extends Service {
   products: Product[];
}

export const ServiceCard = ({ service }: { service: ServiceWithProducts }) => {
   const [open, setOpen] = useState(false);
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
            is_active: !service?.is_active,
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
                        <Switch checked={service?.is_active} onCheckedChange={handleUpdateService} />
                        <ServiceCardActions />
                     </div>
                  </div>
               </FieldContent>
            </Field>
         </CardHeader>
         <CardContent>
            <Separator />
            <div className="flex justify-between items-center gap-2 py-4">
               <div className="flex flex-col gap-2">
                  <CardTitle>Productos</CardTitle>
                  <CardDescription>Listado de productos disponibles para {service?.name}.</CardDescription>
               </div>
               <CreateProductForm providerId={service?.provider_id ?? 0} setOpen={setOpen} open={open} />
            </div>
            <ProductList serviceId={service?.id ?? 0} />
         </CardContent>
      </Card>
   );
};
