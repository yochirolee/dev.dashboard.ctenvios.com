import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFormContext } from "react-hook-form";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import type { ShippingRate } from "@/data/types";
import { useEffect } from "react";

const FixedRatesCombobox = React.memo(function FixedRatesCombobox({ form, index }: { form: any; index: number }) {
   const [open, setOpen] = React.useState(false);

   const formContext = form || useFormContext();
   const { setValue } = formContext;
   const { shipping_rates } = useInvoiceStore(
      useShallow((state) => ({
         shipping_rates: state.shipping_rates,
      }))
   );
   const [selectedRate, setSelectedRate] = React.useState<ShippingRate | null>(
      shipping_rates?.filter((rate) => rate.rate_type === "FIXED")?.[0] || null
   );

   console.log(shipping_rates, "shipping_rates on fixed rates combobox");

   useEffect(() => {
      setValue(`items.${index}.rate_id`, selectedRate?.id || 0);
      setValue(`items.${index}.rate_in_cents`, selectedRate?.rate_in_cents || 0);
      setValue(`items.${index}.description`, selectedRate?.description || "");
      setValue(`items.${index}.cost_in_cents`, selectedRate?.cost_in_cents || 0);
      setValue(`items.${index}.rate_type`, selectedRate?.rate_type || "FIXED");
   }, [shipping_rates, selectedRate]);

   const handleUpdateRate = (rate: ShippingRate) => {
      setSelectedRate(rate);

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
                        ?.filter((rate) => rate.rate_type === "FIXED")
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
