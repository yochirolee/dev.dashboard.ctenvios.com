import React, { useEffect } from "react";
import { Input } from "../ui/input";
import { TableCell, TableRow } from "../ui/table";
import CustomsFeeCombobox from "./customs-fee-combobox";
import { Button } from "../ui/button";
import { DollarSign, PencilIcon, PlusCircle, ShieldCheck, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import FixedRatesCombobox from "./fixed-rates-combobox";
import { centsToDollars } from "@/lib/cents-utils";
import { useOrderStore } from "@/stores/order-store";
import { useShallow } from "zustand/react/shallow";
import { InputGroup, InputGroupInput } from "../ui/input-group";
import { InputGroupAddon } from "../ui/input-group";
import { useItemReducer, type ItemState } from "@/hooks/use-item-reducer";
import type { Customs, ShippingRate } from "@/data/types";

function ItemRowReducer({
   index,
   form,
   remove,
   openDialog,
   registerDispatch,
}: {
   index: number;
   form: any;
   remove: any;
   openDialog: (type: "insurance" | "charge" | "rate", index: number) => void;
   registerDispatch?: (index: number, dispatch: React.Dispatch<any>) => void;
}) {
   const { shipping_rates } = useOrderStore(
      useShallow((state) => ({
         shipping_rates: state.shipping_rates,
      }))
   );

   const activeWeightRate = shipping_rates?.filter((rate: ShippingRate) => rate.unit === "PER_LB")?.[0];

   // Initialize reducer with current form values
   const initialState: ItemState = {
      description: form.getValues(`order_items.${index}.description`) || "",
      weight: form.getValues(`order_items.${index}.weight`),
      price_in_cents: form.getValues(`order_items.${index}.price_in_cents`) || activeWeightRate?.price_in_cents || 0,
      cost_in_cents: form.getValues(`order_items.${index}.cost_in_cents`) || activeWeightRate?.cost_in_cents || 0,
      rate_id: form.getValues(`order_items.${index}.rate_id`) || activeWeightRate?.id || 0,
      unit: form.getValues(`order_items.${index}.unit`) || "PER_LB",
      insurance_fee_in_cents: form.getValues(`order_items.${index}.insurance_fee_in_cents`) || 0,
      customs_fee_in_cents: form.getValues(`order_items.${index}.customs_fee_in_cents`) || 0,
      charge_fee_in_cents: form.getValues(`order_items.${index}.charge_fee_in_cents`) || 0,
      customs_id: form.getValues(`order_items.${index}.customs_id`) || 0,
      subtotal: form.getValues(`order_items.${index}.subtotal`) || 0,
      delivery_fee_in_cents: form.getValues(`order_items.${index}.delivery_fee_in_cents`) || 0,
   };

   const [itemState, dispatch] = useItemReducer(initialState);

   // Register the dispatch function with the parent
   useEffect(() => {
      if (registerDispatch) {
         registerDispatch(index, dispatch);
      }
   }, [index, dispatch, registerDispatch]);

   // Sync reducer state back to react-hook-form
   useEffect(() => {
      form.setValue(`order_items.${index}`, itemState);
      // Calculate total from all items
      const items = form.getValues("order_items") || [];
      const total = items.reduce((acc: number, currentItem: any) => {
         return acc + (Number(currentItem?.subtotal) || 0);
      }, 0);

      form.setValue(`total_in_cents`, total);
   }, [itemState, index, form]);

   useEffect(() => {
      dispatch({
         type: "UPDATE_FIELD",
         payload: { field: "price_in_cents", value: activeWeightRate?.price_in_cents || 0 },
      });
   }, [activeWeightRate?.price_in_cents]);

   const handleToggleUnit = (): void => {
      const newUnit = itemState.unit === "PER_LB" ? "FIXED" : "PER_LB";

      // When changing to FIXED, don't auto-select a rate (user should select manually)
      // When changing to PER_LB, use the active weight rate
      const activeRate = newUnit === "PER_LB" ? activeWeightRate : null;

      dispatch({
         type: "TOGGLE_UNIT",
         payload: {
            newUnit,
            activeRate: activeRate || null,
         },
      });
   };

   const handleCustomsSelect = (customs: Customs): void => {
      dispatch({
         type: "SELECT_CUSTOMS",
         payload: { customs },
      });
   };

   const handleFixedRateSelect = (rate: any): void => {
      dispatch({
         type: "SELECT_FIXED_RATE",
         payload: { rate },
      });
   };

   const handleWeightChange = (value: number | undefined): void => {
      dispatch({
         type: "UPDATE_FIELD",
         payload: {
            field: "weight",
            value,
         },
      });
   };

   const handleRemove = (): void => {
      remove(index);
   };

   return (
      <TableRow key={index}>
         <TableCell>{index + 1}</TableCell>
         <TableCell className=" flex justify-center items-center mt-2">
            <Switch
               checked={itemState.unit === "FIXED"}
               onCheckedChange={handleToggleUnit}
               id={`order_items.${index}.unit-reducer`}
            />
         </TableCell>
         <TableCell className="w-10">
            {itemState.unit === "PER_LB" ? (
               <CustomsFeeCombobox index={index} form={form} onSelect={handleCustomsSelect} />
            ) : (
               <FixedRatesCombobox form={form} index={index} onSelect={handleFixedRateSelect} />
            )}
         </TableCell>
         <TableCell className="inline-flex min-w-[300px] items-center gap-2 w-full">
            <InputGroup>
               <InputGroupInput
                  placeholder="Descripción..."
                  value={itemState.description}
                  onChange={(e) =>
                     dispatch({
                        type: "UPDATE_FIELD",
                        payload: { field: "description", value: e.target.value },
                     })
                  }
               />
               <InputGroupAddon align="inline-end">
                  {itemState.insurance_fee_in_cents > 0 && (
                     <Badge variant="outline">
                        Seguro: {centsToDollars(itemState.insurance_fee_in_cents).toFixed(2)}
                     </Badge>
                  )}
                  {itemState.charge_fee_in_cents > 0 && (
                     <Badge variant="outline" className="">
                        Cargo: {centsToDollars(itemState.charge_fee_in_cents).toFixed(2)}
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
         <TableCell className="text-right">{centsToDollars(itemState.customs_fee_in_cents).toFixed(2)}</TableCell>
         <TableCell className="text-right">{centsToDollars(itemState.price_in_cents).toFixed(2)}</TableCell>

         <TableCell className="text-right">
            <Input
               name={`order_items.${index}.weight`}
               className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
               value={itemState.weight || ""}
               onChange={(e) => {
                  const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                  if (value !== undefined && !isNaN(value)) {
                     handleWeightChange(value);
                  } else if (value === undefined) {
                     handleWeightChange(value);
                  }
               }}
               placeholder="0.00"
               type="number"
               min={0.01}
               step={0.01}
               autoComplete="off"
               onKeyDown={(e) => {
                  if (e.key === "Enter") {
                     e.preventDefault();
                     // Focus on the next item's weight input
                     const nextIndex = index + 1;
                     const nextInput = document.querySelector<HTMLInputElement>(
                        `input[name="order_items.${nextIndex}.weight"]`
                     );
                     if (nextInput) {
                        nextInput.focus();
                        nextInput.select();
                     }
                  }
               }}
               onBlur={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                     const rounded = Math.round(value * 100) / 100;
                     handleWeightChange(rounded);
                     e.target.value = rounded.toString();
                  }
               }}
            />
         </TableCell>
         <TableCell className="text-right">{centsToDollars(itemState.subtotal || 0).toFixed(2)}</TableCell>

         <TableCell className="w-10">
            {index !== 0 && (
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
            )}
         </TableCell>
      </TableRow>
   );
}

// Memoizar para evitar re-render si las props no cambian
export default React.memo(ItemRowReducer);
