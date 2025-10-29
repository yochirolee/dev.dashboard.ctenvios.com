import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgencies } from "@/hooks/use-agencies";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { AgencyRates } from "./agency-rates";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AgencyCreateRatesForm } from "./agency-create-rates-form";
import { useState } from "react";
import { EmptyServicesRates } from "./empty-services-rates";

export default function AgencyServices({ agencyId }: { agencyId: number }) {
   const { data: services, isLoading } = useAgencies.getActivesServicesRates(agencyId);
   const [open, setOpen] = useState(false);

   if (isLoading) return <Skeleton />;
   if (services?.length === 0) {
      return <EmptyServicesRates />;
   }

   return (
      <Card>
         <CardHeader>
            <CardTitle>Servicios y Tarifas</CardTitle>
            <CardDescription>
               Aquí puedes ver los servicios y tarifas de la agencia. Puedes editar las tarifas de los servicios.
            </CardDescription>
         </CardHeader>
         <Separator />
         <CardContent className="space-y-2 lg:space-y-4 m-0 p-2 lg:p-4">
            {services?.map((service: any) => (
               <div key={service?.id} className="flex flex-col p-4 rounded-lg  lg:p-4 my-2 lg:my-4 bg-black/20">
                  <div className="flex   justify-between items-center">
                     <div className="flex flex-col">
                        <div className="flex items-center space-x-4">
                           <h1 className="text-lg font-bold">{service?.provider?.name}</h1>
                           <Badge variant="outline">{service?.service_type}</Badge>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                           <p className="text-sm text-muted-foreground">{service?.description}</p>
                        </div>
                     </div>
                     <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                           <Button variant="outline">
                              <PlusCircle className="w-4 h-4" /> Crear tarifa
                           </Button>
                        </DialogTrigger>
                        <DialogContent>
                           <DialogHeader>
                              <DialogTitle>Crear tarifa</DialogTitle>
                              <DialogDescription>Crear una nueva tarifa para este servicio</DialogDescription>
                           </DialogHeader>
                           <AgencyCreateRatesForm service_id={service.id} buyer_agency_id={agencyId} />
                        </DialogContent>
                     </Dialog>
                  </div>
                  <AgencyRates rates={service.shipping_rates} />
               </div>
            ))}
         </CardContent>
      </Card>
   );
}
