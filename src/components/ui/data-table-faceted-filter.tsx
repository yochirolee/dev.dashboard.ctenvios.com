import * as React from "react";
import { CheckIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
   CommandList,
   CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface DataTableFacetedFilterProps {
   title?: string;
   options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
      color?: string;
   }[];
   selectedValue?: string;
   onSelect: (value: string | undefined) => void;
}

export function DataTableFacetedFilter({
   title,
   options,
   selectedValue,
   onSelect,
}: DataTableFacetedFilterProps): React.ReactElement {
   const selectedOption = options.find((option) => option.value === selectedValue);

   return (
      <Popover>
         <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
               <PlusCircle className="mr-2 h-4 w-4" />
               {title}
               {selectedOption && (
                  <>
                     <Separator orientation="vertical" className="mx-2 h-4" />
                     <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {selectedOption.icon && <selectedOption.icon className="mr-1 h-3 w-3" />}
                        {selectedOption.color && (
                           <span className={`mr-1 h-2 w-2 rounded-full ${selectedOption.color}`} />
                        )}
                        {selectedOption.label}
                     </Badge>
                  </>
               )}
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
               <CommandInput placeholder={title} />
               <CommandList>
                  <CommandEmpty>No hay resultados.</CommandEmpty>
                  <CommandGroup>
                     {options.map((option) => {
                        const isSelected = selectedValue === option.value;
                        return (
                           <CommandItem
                              key={option.value}
                              onSelect={() => {
                                 if (isSelected) {
                                    onSelect(undefined);
                                 } else {
                                    onSelect(option.value);
                                 }
                              }}
                           >
                              <div
                                 className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                 )}
                              >
                                 <CheckIcon className="h-4 w-4" />
                              </div>
                              {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                              {option.color && <span className={`mr-2 h-2 w-2 rounded-full ${option.color}`} />}
                              <span>{option.label}</span>
                           </CommandItem>
                        );
                     })}
                  </CommandGroup>
                  {selectedValue && (
                     <>
                        <CommandSeparator />
                        <CommandGroup>
                           <CommandItem onSelect={() => onSelect(undefined)} className="justify-center text-center">
                              Limpiar filtro
                           </CommandItem>
                        </CommandGroup>
                     </>
                  )}
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   );
}
