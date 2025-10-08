import React, { useEffect } from "react";
import { Input } from "../ui/input";
import { TableCell, TableRow } from "../ui/table";
import { useWatch } from "react-hook-form";
import CustomsFeeCombobox from "./customs-fee-combobox";
import { Button } from "../ui/button";
import { DollarSign, PencilIcon, PlusCircle, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";

import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import FixedRatesCombobox from "./fixed-rates-combobox";
import { centsToDollars, calculate_row_subtotal } from "@/lib/utils";

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

   console.log(item, "item-row");

   useEffect(() => {
      const subtotal = calculate_row_subtotal(
         item?.rate_in_cents,
         item?.weight,
         item?.customs_fee_in_cents,
         item?.charge_fee_in_cents || 0,
         item?.insurance_fee_in_cents || 0,
         item?.rate_type
      );

      form.setValue(`items.${index}.subtotal`, subtotal);

      // Calculate total from all items
      const items = form.getValues("items") || [];
      const total = items.reduce((acc: number, currentItem: any) => {
         return acc + (Number(currentItem?.subtotal) || 0);
      }, 0);

      form.setValue(`total_in_cents`, total);
   }, [
      item?.rate_in_cents || 0,
      item?.weight || 0,
      item?.customs_fee_in_cents || 0,
      item?.charge_fee_in_cents || 0,
      item?.insurance_fee_in_cents || 0,
      item?.rate_type || "WEIGHT",
   ]);

   const [byRate, setByRate] = useState(false);

   useEffect(() => {
      form.setValue(`items.${index}.subtotal`, 0);
      form.setValue(`items.${index}.description`, "");
   }, [byRate]);

   const handleRemove = () => {
      // Use index for removal - React Hook Form's remove function expects the index
      remove(index);
   };

   return (
      <TableRow key={index}>
         <TableCell>{index + 1}</TableCell>
         <TableCell className=" flex justify-center items-center mt-2">
            <Switch checked={byRate} onCheckedChange={() => setByRate(!byRate)} id="mode" />
         </TableCell>
         <TableCell className="w-10">
            {byRate ? (
               <FixedRatesCombobox form={form} index={index} />
            ) : (
               <CustomsFeeCombobox index={index} form={form} />
            )}
         </TableCell>
         <TableCell className="flex items-center gap-2 ">
            <div className="w-full relative gap-2">
               <Input className="lg:w-full pr-40 w-auto" {...form.register(`items.${index}.description`)} />
               <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="flex gap-2">
                     {item.insurance_fee_in_cents > 0 && (
                        <Badge variant="outline">Seguro: {centsToDollars(item.insurance_fee_in_cents).toFixed(2)}</Badge>
                     )}
                     {item.charge_fee_in_cents > 0 && (
                        <Badge variant="outline" className="">
                           Cargo: {centsToDollars(item.charge_fee_in_cents).toFixed(2)}
                        </Badge>
                     )}
                  </div>
               </div>
            </div>
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
         <TableCell className="text-right">{centsToDollars(item.rate_in_cents).toFixed(2)}</TableCell>
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
