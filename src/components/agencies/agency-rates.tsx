import { PencilIcon, TriangleAlertIcon } from "lucide-react";
import { TableCell, TableHeader, TableHead, TableRow, TableBody, Table } from "@/components/ui/table";
import type { ShippingRate } from "@/data/types";
import { centsToDollars } from "@/lib/cents-utils";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { EmptyServicesRates } from "./empty-services-rates";
import { AgencyUpdateRatesForm } from "./agency-update-rates-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { useShippingRates } from "@/hooks/use-shipping-rates";
import { toast } from "sonner";

export const AgencyRates = ({ shippingRates }: { shippingRates: ShippingRate[] }) => {
   if (shippingRates?.length === 0) return <EmptyServicesRates />;
   return (
      <Table>
         <TableHeader>
            <TableRow>
               <TableHead>Id</TableHead>
               <TableHead>Nombre</TableHead>
               <TableHead>Descripción</TableHead>
               <TableHead>Tipo</TableHead>
               <TableHead>Costo Agencia</TableHead>
               <TableHead>Venta al Público</TableHead>
               <TableHead>Profit</TableHead>
               <TableHead>Activo</TableHead>
               <TableHead className="w-10 text-right"></TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {shippingRates?.map((rate: ShippingRate) => (
               <RateRow key={rate.id} rate={rate} />
            ))}
         </TableBody>
      </Table>
   );
};

const RateRow = ({ rate }: { rate: ShippingRate }) => {
   const [isOpen, setIsOpen] = useState(false);
   const { mutate: updateRate } = useShippingRates.update(rate?.id as number);
   const calculateProfit = (rate: ShippingRate) => {
      return rate?.price_in_cents - rate?.cost_in_cents;
   };

   const handleActivate = (rate: ShippingRate) => {
      rate.is_active = !rate.is_active;
      updateRate(rate as ShippingRate, {
         onSuccess: () => {
            toast.success("Tarifa actualizada correctamente");
         },
         onError: (error) => {
            const errorMessage =
               (error as any)?.response?.data?.error ||
               (error as any)?.response?.data?.message ||
               "Error al actualizar la tarifa";
            toast.error(errorMessage);
         },
      });
   };

   return (
      <TableRow>
         <TableCell>
            <p>{rate?.id}</p>
         </TableCell>
         <TableCell>
            <p>{rate?.name}</p>
         </TableCell>
         <TableCell>
            <p>{rate?.description}</p>
         </TableCell>
         <TableCell>
            <Badge variant="outline">{rate?.unit}</Badge>
         </TableCell>
         <TableCell>
            <p>{centsToDollars(rate?.cost_in_cents)?.toFixed(2)} USD</p>
         </TableCell>
         <TableCell>
            <p>{centsToDollars(rate?.price_in_cents)?.toFixed(2)} USD</p>
         </TableCell>
         <TableCell>
            <p>
               {calculateProfit(rate) > 0
                  ? `+${centsToDollars(calculateProfit(rate))?.toFixed(2)} USD`
                  : `${centsToDollars(calculateProfit(rate))?.toFixed(2)} USD`}
            </p>
         </TableCell>
         <TableCell>
            <Switch checked={rate?.is_active} onCheckedChange={() => handleActivate(rate)} />
         </TableCell>
         <TableCell className="flex justify-end">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
               <DialogTrigger asChild>
                  <Button variant="ghost">
                     <PencilIcon size={16} />
                  </Button>
               </DialogTrigger>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle>Actualizar tarifa</DialogTitle>
                     <DialogDescription>Actualiza la tarifa para este servicio</DialogDescription>
                  </DialogHeader>
                  <AgencyUpdateRatesForm rate={rate} setIsOpen={setIsOpen} />
               </DialogContent>
            </Dialog>
         </TableCell>
      </TableRow>
   );
};
