import React, { useEffect } from "react";
import { Input } from "../ui/input";
import { TableCell, TableRow } from "../ui/table";
import { useWatch } from "react-hook-form";
import CustomsFeeCombobox from "./customs-fee-combobox";
import { Button } from "../ui/button";
import { DollarSign, PencilIcon, PlusCircle, ShieldCheck, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";

import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import FixedRatesCombobox from "./fixed-rates-combobox";
import { centsToDollars, calculate_row_subtotal } from "@/lib/cents-utils";
import { useOrderStore } from "@/stores/order-store";
import { useShallow } from "zustand/react/shallow";
import { InputGroup, InputGroupInput } from "../ui/input-group";
import { InputGroupAddon } from "../ui/input-group";

function ItemRow({
   index,
   form,
   remove,

   openDialog,
}: {
   index: number;
   form: any;
   remove: any;

   openDialog: (type: "insurance" | "charge" | "rate", index: number) => void;
}) {
   // Watch form values to trigger re-renders when they change
   const item = useWatch({
      control: form.control,
      name: `items.${index}`, // escuchas todo el objeto item
   });

   useEffect(() => {
      const subtotal = calculate_row_subtotal(
         item?.price_in_cents,
         item?.weight,
         item?.customs_fee_in_cents,
         item?.charge_fee_in_cents || 0,
         item?.insurance_fee_in_cents || 0,
         item?.unit
      );

      form.setValue(`items.${index}.subtotal`, subtotal);

      // Calculate total from all items
      const items = form.getValues("items") || [];
      const total = items.reduce((acc: number, currentItem: any) => {
         return acc + (Number(currentItem?.subtotal) || 0);
      }, 0);

      form.setValue(`total_in_cents`, total);
   }, [
      item?.price_in_cents || 0,
      item?.weight || 0,
      item?.customs_fee_in_cents || 0,
      item?.charge_fee_in_cents || 0,
      item?.insurance_fee_in_cents || 0,
      item?.unit || "PER_LB",
   ]);

   const { shipping_rates } = useOrderStore(
      useShallow((state) => ({
         shipping_rates: state.shipping_rates,
      }))
   );

   const activeWeightRate = shipping_rates?.filter((rate) => rate.unit === "PER_LB")?.[0];

   useEffect(() => {
      form.setValue(`items.${index}.subtotal`, 0);
      form.setValue(`items.${index}.description`);
      form.setValue(`items.${index}.rate_id`, activeWeightRate?.id || 0);
      form.setValue(`items.${index}.price_in_cents`, activeWeightRate?.price_in_cents || 0);
      form.setValue(`items.${index}.cost_in_cents`, activeWeightRate?.cost_in_cents || 0);
      form.setValue(`items.${index}.customs_fee_in_cents`, 0);
      form.setValue(`items.${index}.unit`, activeWeightRate?.unit || "PER_LB");
   }, [item.unit]);

   const handleRemove = () => {
      // Use index for removal - React Hook Form's remove function expects the index
      remove(index);
   };

   console.log(item, "item-row");

   return (
      <TableRow key={index}>
         <TableCell>{index + 1}</TableCell>
         <TableCell className=" flex justify-center items-center mt-2">
            <Switch
               checked={item.unit === "FIXED"}
               onCheckedChange={() => {
                  form.setValue(`items.${index}.unit`, item.unit === "PER_LB" ? "FIXED" : "PER_LB");
               }}
               id={`items.${index}.unit` + item.id}
            />
         </TableCell>
         <TableCell className="w-10">
            {item.unit === "PER_LB" ? (
               <CustomsFeeCombobox index={index} form={form} />
            ) : (
               <FixedRatesCombobox form={form} index={index} />
            )}
         </TableCell>
         <TableCell className="inline-flex min-w-[300px] items-center gap-2 w-full">
            <InputGroup>
               <InputGroupInput placeholder="Descripción..." {...form.register(`items.${index}.description`)} />
               <InputGroupAddon align="inline-end">
                  {centsToDollars(item.delivery_fee_in_cents).toFixed(2)}
                  {item.insurance_fee_in_cents > 0 && (
                     <Badge variant="outline">Seguro: {centsToDollars(item.insurance_fee_in_cents).toFixed(2)}</Badge>
                  )}
                  {item.charge_fee_in_cents > 0 && (
                     <Badge variant="outline" className="">
                        Cargo: {centsToDollars(item.charge_fee_in_cents).toFixed(2)}
                     </Badge>
                  )}
               </InputGroupAddon>
            </InputGroup>

            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                     <PlusCircle />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => openDialog("charge", index)} className="flex items-center gap-2">
                     <DollarSign />
                     <span>Cargo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDialog("insurance", index)} className="flex items-center gap-2">
                     <ShieldCheck />
                     <span>Seguro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDialog("rate", index)} className="flex items-center gap-2">
                     <PencilIcon />
                     <span>Cambiar Tarifa</span>
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </TableCell>
         <TableCell className="text-right">{centsToDollars(item.customs_fee_in_cents).toFixed(2)}</TableCell>

         <TableCell>
            <Input
               className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
               {...form.register(`items.${index}.weight`, {
                  valueAsNumber: true,
                  validate: (value: number) => {
                     if (!value) return true;
                     const decimalPlaces = (value.toString().split(".")[1] || "").length;
                     return decimalPlaces <= 2 || "Solo se permiten 2 decimales";
                  },
               })}
               placeholder="0.00"
               type="number"
               min={0.01}
               step={0.01}
               autoComplete="off"
               onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                     const rounded = Math.round(value * 100) / 100;
                     form.setValue(`items.${index}.weight`, rounded);
                     e.target.value = rounded.toString();
                  }
               }}
            />
         </TableCell>
         <TableCell className="text-right">{centsToDollars(item.price_in_cents).toFixed(2)}</TableCell>
         <TableCell className="text-right">{centsToDollars(item.subtotal || 0).toFixed(2)}</TableCell>

         <TableCell className="w-10">
            <Button
               type="button"
               variant="ghost"
               size="icon"
               onClick={() => {
                  if (index !== 0) {
                     handleRemove();
                  }
               }}
            >
               <Trash2 />
            </Button>
         </TableCell>
      </TableRow>
   );
}

// Memoizar para evitar re-render si las props no cambian
export default React.memo(ItemRow);
