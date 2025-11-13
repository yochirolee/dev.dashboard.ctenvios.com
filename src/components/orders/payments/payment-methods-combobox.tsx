import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { Command, CommandGroup, CommandItem, CommandList, CommandEmpty, CommandInput } from "@/components/ui/command";
import { ItemMedia } from "@/components/ui/item";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { payment_methods } from "@/data/data";

export const PaymentMethodCombobox = () => {
   const form = useFormContext();
   const [open, setOpen] = useState(false);
   return (
      <Controller
         control={form.control}
         name="method"
         render={({ field, fieldState }) => (
            <Field>
               <FieldLabel>Método de pago</FieldLabel>
               <FieldContent>
                  <Popover open={open} onOpenChange={setOpen}>
                     <PopoverTrigger asChild>
                        <Button
                           variant="outline"
                           role="combobox"
                           aria-expanded={open}
                           className="w-full justify-between"
                        >
                           {field.value
                              ? payment_methods.find((payment_method) => payment_method.id === field.value)?.title
                              : "Select payment method"}
                           <ChevronsUpDown className="opacity-50" />
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent style={{ width: "var(--radix-popover-trigger-width)" }}>
                        <Command shouldFilter={false} className="w-full">
                           <CommandInput placeholder="Search payment method..." className="h-9" />
                           <CommandList>
                              <CommandEmpty>No payment method found.</CommandEmpty>
                              <CommandGroup>
                                 {payment_methods.map((method) => (
                                    <CommandItem
                                       key={method.id}
                                       value={method.id}
                                       onSelect={(currentValue) => {
                                          form.setValue(field.name, currentValue);
                                          setOpen(false);
                                       }}
                                    >
                                       <ItemMedia variant="icon">
                                          <method.icon className="size-4" />
                                       </ItemMedia>
                                       <FieldContent className="flex flex-col gap-2">
                                          <FieldTitle>{method.title}</FieldTitle>
                                          <FieldDescription className="text-muted-foreground text-xs font-light">
                                             {method.description}
                                          </FieldDescription>
                                       </FieldContent>

                                       <Check
                                          className={cn(
                                             "ml-auto",
                                             field.value === method.id ? "opacity-100" : "opacity-0"
                                          )}
                                       />
                                       {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </CommandItem>
                                 ))}
                              </CommandGroup>
                           </CommandList>
                        </Command>
                     </PopoverContent>
                  </Popover>
               </FieldContent>
            </Field>
         )}
      />
   );
};
