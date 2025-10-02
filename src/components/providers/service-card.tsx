import type { Service, Provider, ShippingRate } from "@/data/types";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { CreateBaseRateForm } from "./create-base-rate-form";
import { BaseRatesList } from "./base-rates-list";
import { useState } from "react";
import { UpdateBaseRateForm } from "./update-base-rate-form";

interface ServiceWithRates extends Service {
   shipping_rates: ShippingRate[];
}

export const ServiceCard = ({ service, provider }: { service: ServiceWithRates; provider: Provider }) => {
   const [openCreateBaseRateDialog, setOpenCreateBaseRateDialog] = useState(false);
   const [openUpdateBaseRateDialog, setOpenUpdateBaseRateDialog] = useState(false);
   const [rateToUpdate, setRateToUpdate] = useState<ShippingRate | null>(null);

   const handleUpdate = (rate: ShippingRate) => {
      setRateToUpdate(rate || null);
      setOpenUpdateBaseRateDialog(true);
   };
   const shipping_rates = service.shipping_rates;

   return (
      <Card key={service?.id} className="flex flex-col mb-4">
         <CardHeader className="flex  justify-between items-center">
            <div className="flex items-center gap-2">
               <h1 className="text-lg font-bold">{provider?.name}</h1>
               <Badge variant="outline">{service?.service_type}</Badge>
               <p className="text-sm text-muted-foreground">{service?.description}</p>
            </div>

            <CreateBaseRateForm
               open={openCreateBaseRateDialog}
               serviceId={service.id || undefined}
               setOpen={setOpenCreateBaseRateDialog}
               providerId={provider.id || undefined}
            />
         </CardHeader>
         <CardContent>
            <BaseRatesList rates={shipping_rates} handleUpdate={handleUpdate} />
         </CardContent>
         <UpdateBaseRateForm
            key={`update-base-rate-form-${service.id}`}
            rate={rateToUpdate || null}
            open={openUpdateBaseRateDialog}
            setOpen={setOpenUpdateBaseRateDialog}
            providerId={provider.id}
            setRate={setRateToUpdate}
         />
      </Card>
   );
};
