import { useState } from "react";
import { ShareDialog } from "../shares/share-dialog";
import { AgencyUpdateRatesForm } from "./agencies-update-rates-form";
import {} from "@/components/ui/dropdown-menu";
import { PencilIcon } from "lucide-react";
import { TableCell, TableHeader, TableHead, TableRow, TableBody, Table } from "@/components/ui/table";
import type { ShippingRate } from "@/data/types";
import { centsToDollars } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { useShippingRates } from "@/hooks/use-shipping-rates";
import { Button } from "../ui/button";

export const AgencyRates = ({ rates }: { rates: ShippingRate[] }) => {
	const [open, setOpen] = useState(false);
	const [rateForUpdate, setRateForUpdate] = useState<ShippingRate | null>(null);

	const handleUpdate = (rate: ShippingRate) => {
		setRateForUpdate(rate);
		setOpen(true);
	};

   return (
      <>
         <Table>
            <TableHeader>
               <TableRow>
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
                  <RateRow key={rate.id} rate={rate} handleUpdate={handleUpdate} />
               ))}
            </TableBody>
		   </Table>
		   <AgencyUpdateRatesForm key={`update-rate-form-${rateForUpdate?.id}`} rate={rateForUpdate} open={open} setOpen={setOpen} />
      </>
   );
};

const RateRow = ({ rate, handleUpdate }: {  rate: ShippingRate, handleUpdate: (rate: ShippingRate) => void }) => {
   const { mutate: updateRate } = useShippingRates.update();

   const calculateProfit = (rate: ShippingRate) => {
      return rate?.rate_in_cents - rate?.cost_in_cents;
   };

   const handleActivate = (rate: ShippingRate) => {
      rate.is_active = !rate.is_active;
      updateRate({ data: rate });
   };

   return (
      <TableRow key={rate.id} className="border-b-0">
         <TableCell>
            <p>{rate?.name}</p>
         </TableCell>
         <TableCell>
            <Badge variant="outline">{rate?.rate_type}</Badge>
         </TableCell>
         <TableCell>
            <p>{centsToDollars(rate?.cost_in_cents)?.toFixed(2)} USD</p>
         </TableCell>
         <TableCell>
            <p>{centsToDollars(rate?.rate_in_cents)?.toFixed(2)} USD</p>
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
