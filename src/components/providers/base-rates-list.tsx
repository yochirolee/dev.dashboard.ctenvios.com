import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { TableCell, TableHeader, TableHead, TableRow, TableBody, Table } from "@/components/ui/table";
import type { ShippingRate } from "@/data/types";
import { centsToDollars } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { useShippingRates } from "@/hooks/use-shipping-rates";
import { Card } from "../ui/card";

export const BaseRatesList = ({
   rates,
   handleUpdate,
}: {
   rates: ShippingRate[];
   handleUpdate: (rate: ShippingRate) => void;
}) => {
   if (!rates.length)
      return (
         <Card className="flex border-dashed justify-center items-center h-full dark:bg-gray-800/30">
            <p>No hay tarifas</p>
            <p>Agrega una tarifa para el servicio</p>
         </Card>
      );

   return (
      <Table>
         <TableHeader>
            <TableRow>
               <TableHead>Nombre</TableHead>
               <TableHead>Descripción</TableHead>
               <TableHead>Tipo</TableHead>
               <TableHead className="text-right">Peso Minimo</TableHead>
               <TableHead className="text-right">Peso Maximo</TableHead>
               <TableHead className="text-right">Costo Agencias</TableHead>
               <TableHead className="text-right">Venta al Público</TableHead>
               <TableHead className="text-right">Profit</TableHead>
               <TableHead>Activo</TableHead>
               <TableHead className="w-10 text-right"></TableHead>
            </TableRow>
         </TableHeader>
         <TableBody>
            {rates?.map((rate: ShippingRate) => (
               <BaseRateRow key={rate.id} rate={rate} handleUpdate={handleUpdate} />
            ))}
         </TableBody>
      </Table>
   );
};

const BaseRateRow = ({ rate, handleUpdate }: { rate: ShippingRate; handleUpdate: (rate: ShippingRate) => void }) => {
   const { mutate: updateBaseRate } = useShippingRates.updateBaseRate(undefined);

   const calculateProfit = (rate: ShippingRate) => {
      return rate?.rate_in_cents - rate?.cost_in_cents;
   };

   const handleActivate = (rate: ShippingRate) => {
      rate.is_active = !rate.is_active;
      updateBaseRate({ data: rate });
   };

   return (
      <TableRow key={rate.id} className="border-b-0">
         <TableCell>
            <p>{rate?.name}</p>
         </TableCell>
         <TableCell>
            <p>{rate?.description}</p>
         </TableCell>
         <TableCell>
            <Badge variant="outline">{rate?.rate_type}</Badge>
         </TableCell>
         <TableCell className="text-right">
            <p>{rate?.min_weight} lbs</p>
         </TableCell>
         <TableCell className="text-right">
            <p>{rate?.max_weight} lbs</p>
         </TableCell>
         <TableCell className="text-right">
            <p>{centsToDollars(rate?.cost_in_cents)?.toFixed(2)} USD</p>
         </TableCell>
         <TableCell className="text-right">
            <p>{centsToDollars(rate?.rate_in_cents)?.toFixed(2)} USD</p>
         </TableCell>
         <TableCell className="text-right">
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
            <DropdownMenu>
               <DropdownMenuTrigger>
                  <MoreVerticalIcon size={16} />
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleUpdate(rate)}>
                     <PencilIcon size={16} /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                     <Trash2Icon size={16} /> Eliminar
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </TableCell>
      </TableRow>
   );
};
