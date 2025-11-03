import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { Agency } from "@/data/types";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

export const AgenciesCombobox = ({
   isLoading,
   selectedAgency,
   setSelectedAgency,
   agencies,
}: {
   isLoading: boolean;
   selectedAgency: Agency | null;
   setSelectedAgency: (agency: Agency | null) => void;
   agencies: Agency[];
}) => {
   const [open, setOpen] = useState(false);

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className="md:w-[300px] md:flex-none flex-1 justify-between"
            >
               {isLoading ? (
                  <Skeleton className="h-4 w-full" />
               ) : selectedAgency?.id ? (
                  agencies.find((agency: any) => agency.id === selectedAgency.id)?.name + " - " + selectedAgency.id
               ) : (
                  "Agencias..."
               )}
               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-full p-0">
            <Command className="w-[300px]">
               <CommandInput placeholder="Search Agency..." />
               <CommandList>
                  <CommandEmpty>No agencies found.</CommandEmpty>
                  <CommandGroup>
                     {agencies.map((agency: any) => (
                        <CommandItem
                           key={agency.id}
                           value={agency.id}
                           onSelect={() => {
                              setSelectedAgency(agency);
                              setOpen(false);
                           }}
                        >
                           <Check
                              className={cn(
                                 "mr-2 h-4 w-4",
                                 selectedAgency?.id === agency.id ? "opacity-100" : "opacity-0"
                              )}
                           />
                           {agency.name + " - " + agency.id}
                        </CommandItem>
                     ))}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   );
};
