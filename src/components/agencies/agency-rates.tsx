import { PencilIcon } from "lucide-react";
import { TableCell, TableHeader, TableHead, TableRow, TableBody, Table } from "@/components/ui/table";
import type { ShippingRate } from "@/data/types";
import { centsToDollars } from "@/lib/cents-utils";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";

export const AgencyRates = ({ rates }: { rates: ShippingRate[] }) => {
   return (
      <>
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Costo Agencia</TableHead>
                  <TableHead>Venta al Público</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="w-10 text-right"></TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {rates?.map((rate: ShippingRate) => (
                  <RateRow key={rate.id} rate={rate} />
               ))}
            </TableBody>
         </Table>
      </>
   );
};

const RateRow = ({ rate }: { rate: ShippingRate }) => {
   const calculateProfit = (rate: ShippingRate) => {
      return rate?.price_in_cents - rate?.cost_in_cents;
   };

   const handleActivate = (rate: ShippingRate) => {
      rate.is_active = !rate.is_active;
   };

   const handleUpdate = (rate: ShippingRate) => {
      rate.is_active = !rate.is_active;
   };

   return (
      <TableRow key={rate.id} className="border-b-0">
         <TableCell>
            <p>{rate?.id}</p>
         </TableCell>
         <TableCell>
            <p>{rate?.name}</p>
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
            <Button variant="ghost" onClick={() => handleUpdate(rate)}>
               <PencilIcon size={16} />
            </Button>
         </TableCell>
      </TableRow>
   );
};
