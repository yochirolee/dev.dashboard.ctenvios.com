import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "../../ui/separator";
import type { Product, Provider, Service } from "@/data/types";
import { NewServiceForm } from "./new-service-form";
import { useState } from "react";
import { ServiceCard } from "./service-card";

interface ServiceWithProducts extends Service {
   products: Product[];
}

interface ServicesListProps {
   provider: Provider;
   services: ServiceWithProducts[];
}

export default function ServicesList({ provider, services }: ServicesListProps) {
   const [open, setOpen] = useState(false);

   return (
      <Card>
         <CardHeader>
            <CardTitle>Servicios y Tarifas</CardTitle>
            <div className="flex items-center justify-between gap-2">
               <CardDescription>
                  Aquí puedes ver los servicios y productos. Puedes crear nuevos productos para los servicios.
               </CardDescription>

               <NewServiceForm open={open} setOpen={setOpen} provider={provider} />
            </div>
         </CardHeader>
         <Separator />
         <CardContent>
            {services?.map((service: ServiceWithProducts) => (
               <ServiceCard key={service?.id} service={service} provider={provider} />
            ))}
         </CardContent>
      </Card>
   );
}
