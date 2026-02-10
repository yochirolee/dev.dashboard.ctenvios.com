import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormField } from "../ui/form";
import { useCustoms } from "@/hooks/use-customs";
import type { Customs } from "@/data/types";
import { Skeleton } from "../ui/skeleton";
import { useFormContext, type UseFormReturn } from "react-hook-form";

const CustomsFeeCombobox = React.memo(function CustomsFeeCombobox({
   index,
   form,
   onSelect,
}: {
   index: number;
   form?: UseFormReturn<any>;
   onSelect?: (customs: Customs) => void;
}) {
   const [open, setOpen] = React.useState(false);
   const [searchQuery, setSearchQuery] = React.useState("");
   const { data, isLoading } = useCustoms.get(0, 300);

   // Use form prop if provided, otherwise use form context
   const formContext = form || useFormContext();
   const { control, setValue } = formContext;

   // Filter customs based on search query
   const filteredCustoms = React.useMemo(() => {
      if (!data?.rows || !searchQuery.trim()) {
         return data?.rows || [];
      }

      const query = searchQuery.toLowerCase().trim();
      return data.rows.filter((custom: Customs) => custom.name.toLowerCase().includes(query));
   }, [data?.rows, searchQuery]);

   const handleSearchChange = (value: string) => {
      setSearchQuery(value);
   };

   const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
         setSearchQuery("");
      }
   };

   return (
      <FormField
         control={control}
         name={`order_items.${index}.customs_id`}
         render={({ field }) => (
            <Popover open={open} onOpenChange={handleOpenChange}>
               <PopoverTrigger asChild>
                  <Button
                     id={`customs-fee-combobox-${index}`}
                     variant="outline"
                     role="combobox"
                     aria-expanded={open}
                     aria-controls={`customs-fee-combobox-${index}`}
                     className={cn("w-[200px] justify-between", !field.value && "text-muted-foreground")}
                  >
                     {isLoading ? (
                        <Skeleton className="w-full h-4" />
                     ) : (
                        (() => {
                           const selectedCustom = data?.rows?.find((custom: Customs) => custom.id === field.value);
                           return selectedCustom?.name
                              ? selectedCustom.name.length > 20
                                 ? `${selectedCustom.name.substring(0, 20)}...`
                                 : selectedCustom.name
                              : "Seleccionar Arancel";
                        })()
                     )}
                     <ChevronsUpDown className="opacity-50" />
                  </Button>
               </PopoverTrigger>
               <PopoverContent className="w-[200px] p-0">
                  <Command shouldFilter={false}>
                     <CommandInput placeholder="Buscar Arancel..." onValueChange={handleSearchChange} />
                     <CommandList>
                        <CommandEmpty>No se encontraron Aranceles.</CommandEmpty>
                        <CommandGroup>
                           {filteredCustoms?.map((custom: Customs) => (
                              <CommandItem
                                 key={custom?.id}
                                 value={custom?.name}
                                 onSelect={() => {
                                    // Always update field to keep FormField in sync
                                    field.onChange(custom.id);

                                    // If onSelect callback is provided, use it
                                    if (onSelect) {
                                       onSelect(custom);
                                    } else {
                                       // Otherwise use default behavior with form.setValue
                                       setValue(`order_items.${index}.description`, custom.description, {
                                          shouldDirty: true,
                                          shouldTouch: true,
                                       });
                                       setValue(`order_items.${index}.customs_fee_in_cents`, custom.fee_in_cents, {
                                          shouldDirty: true,
                                          shouldTouch: true,
                                       });
                                    }

                                    setOpen(false);
                                 }}
                              >
                                 {custom.name}
                                 <Check
                                    className={cn("ml-auto", field?.value === custom?.id ? "opacity-100" : "opacity-0")}
                                 />
                              </CommandItem>
                           ))}
                        </CommandGroup>
                     </CommandList>
                  </Command>
               </PopoverContent>
            </Popover>
         )}
      />
   );
});

export default CustomsFeeCombobox;
