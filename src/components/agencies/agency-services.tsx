import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgencies } from "@/hooks/use-agencies";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { AgencyRates } from "./agency-rates";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AgencyCreateRatesForm } from "./agency-create-rates-form";
import { useState } from "react";
import { EmptyServicesRates } from "./empty-services-rates";
import { Spinner } from "../ui/spinner";

export default function AgencyServices({ agencyId }: { agencyId: number }) {
   const { data: services, isLoading } = useAgencies.getServicesWithRates(agencyId);
   const [openDialogId, setOpenDialogId] = useState<number | null>(null);

   if (isLoading)
      return (
         <Card className="flex justify-center items-center h-full">
            <CardContent>
               <Spinner />
            </CardContent>
         </Card>
      );
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
         <CardContent className="space-y-4">
            {services?.map((service: any) => (
               <div key={service?.id} className="flex flex-col rounded-lg   bg-black/20">
                  {service?.is_active ? (
                     <Card>
                        <CardHeader>
                           <div className="flex items-center justify-between">
                              <CardTitle className="flex flex-col">
                                 <div className="flex  gap-2">
                                    <h1 className="text-lg font-bold">{service?.provider?.name}</h1>
                                    <Badge variant="outline">{service?.service_type}</Badge>
                                 </div>
                                 <p className="text-sm text-muted-foreground">{service?.description}</p>
                              </CardTitle>
                              <CardDescription>
                                 <Dialog
                                    open={openDialogId === service.id}
                                    onOpenChange={(open) => setOpenDialogId(open ? service.id : null)}
                                 >
                                    <DialogTrigger asChild>
                                       <Button variant="outline">
                                          <PlusCircle size={16} />
                                          <span className="hidden lg:block">Crear tarifa</span>
                                       </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                       <DialogHeader>
                                          <DialogTitle>Crear tarifa</DialogTitle>
                                          <DialogDescription>
                                             Crear una nueva tarifa para este servicio
                                          </DialogDescription>
                                       </DialogHeader>

                                       <AgencyCreateRatesForm
                                          service_id={service.id}
                                          buyer_agency_id={agencyId}
                                          setIsOpen={(open) => setOpenDialogId(open ? service.id : null)}
                                       />
                                    </DialogContent>
                                 </Dialog>
                              </CardDescription>
                           </div>
                        </CardHeader>

                        <CardContent>
                           <AgencyRates shippingRates={service?.shipping_rates || []} />
                        </CardContent>
                     </Card>
                  ) : null}
               </div>
            ))}
         </CardContent>
      </Card>
   );
}
