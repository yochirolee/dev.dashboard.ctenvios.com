import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFormContext, useWatch } from "react-hook-form";
import { useOrderStore } from "@/stores/order-store";
import { useShallow } from "zustand/react/shallow";
import type { ShippingRate } from "@/data/types";
import { useEffect } from "react";

const FixedRatesCombobox = React.memo(function FixedRatesCombobox({
   form,
   index,
   onSelect,
}: {
   form: any;
   index: number;
   onSelect?: (rate: ShippingRate) => void;
}) {
   const [open, setOpen] = React.useState(false);

   const formContext = form || useFormContext();
   const { setValue, control } = formContext;
   const { shipping_rates } = useOrderStore(
      useShallow((state) => ({
         shipping_rates: state.shipping_rates,
      }))
   );

   // Watch the rate_id from form to sync with form changes
   const formRateId = useWatch({
      control,
      name: `order_items.${index}.rate_id`,
   });

   // Derive selectedRate from form value instead of local state
   const selectedRate = React.useMemo(() => {
      if (!formRateId) return null;
      return shipping_rates?.find((rate) => rate.id === formRateId && rate.unit === "FIXED") || null;
   }, [formRateId, shipping_rates]);

   useEffect(() => {
      // Only update form if onSelect callback is not provided (default behavior)
      if (!onSelect && selectedRate) {
         setValue(`order_items.${index}.rate_id`, selectedRate?.id || 0);
         setValue(`order_items.${index}.price_in_cents`, selectedRate?.price_in_cents || 0);
         setValue(`order_items.${index}.description`, selectedRate?.description || "");
         setValue(`order_items.${index}.cost_in_cents`, selectedRate?.cost_in_cents || 0);
         setValue(`order_items.${index}.unit`, selectedRate?.unit || "FIXED");
      }
   }, [shipping_rates, selectedRate, onSelect]);

   const handleUpdateRate = (rate: ShippingRate): void => {
      // Always update form to keep it in sync
      setValue(`order_items.${index}.rate_id`, rate?.id || 0);

      // If onSelect callback is provided, use it
      if (onSelect) {
         onSelect(rate);
      } else {
         // Otherwise use default behavior with form.setValue for other fields
         setValue(`order_items.${index}.price_in_cents`, rate?.price_in_cents || 0);
         setValue(`order_items.${index}.description`, rate?.description || "");
         setValue(`order_items.${index}.cost_in_cents`, rate?.cost_in_cents || 0);
         setValue(`order_items.${index}.unit`, rate?.unit || "FIXED");
      }

      setOpen(false);
   };

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               id={`fixed-rates-combobox`}
               variant="outline"
               role="combobox"
               aria-expanded={open}
               aria-controls={`fixed-rates-combobox`}
               className={cn("w-[200px] justify-between", !selectedRate?.name && "text-muted-foreground")}
            >
               {selectedRate?.name
                  ? selectedRate.name.length > 20
                     ? `${selectedRate.name.substring(0, 20)}...`
                     : selectedRate.name
                  : "Seleccionar Tarifa"}
               <ChevronsUpDown className="opacity-50" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-[200px] p-0">
            <Command>
               <CommandInput placeholder="Buscar Tarifa..." />
               <CommandList>
                  <CommandEmpty>No se encontraron Tarifas.</CommandEmpty>
                  <CommandGroup>
                     {shipping_rates
                        ?.filter((rate) => rate.unit === "FIXED")
                        ?.map((rate: ShippingRate) => (
                           <CommandItem
                              key={rate?.id}
                              value={rate?.name}
                              onSelect={() => {
                                 handleUpdateRate(rate);
                              }}
                           >
                              {rate.name}
                              <Check
                                 className={cn(
                                    "ml-auto",
                                    selectedRate?.name === rate.name ? "opacity-100" : "opacity-0"
                                 )}
                              />
                           </CommandItem>
                        ))}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   );
});

export default FixedRatesCombobox;
