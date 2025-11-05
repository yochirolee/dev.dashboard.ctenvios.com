import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useProviders } from "@/hooks/use-providers";

export const ProvidersCombobox = ({
   selectedProvider,
   setSelectedProvider,
}: {
   selectedProvider: number;
   setSelectedProvider: (provider: number) => void;
}) => {
   const [open, setOpen] = useState(false);

   const { data: providers = [], isLoading, error } = useProviders.get();

   if (error) {
      return <div>Error loading agencies</div>;
   }

   return (
      <>
         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
               <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="lg:w-[300px] lg:flex-none flex-1 justify-between"
               >
                  {isLoading ? (
                     <Skeleton className="h-4 w-full" />
                  ) : selectedProvider ? (
                     providers.find((provider: any) => provider.id === selectedProvider)?.name +
                     " - " +
                     selectedProvider
                  ) : (
                     "Proveedores..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
               </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
               <Command className="w-[300px]">
                  <CommandInput placeholder="Search Provider..." />
                  <CommandList>
                     <CommandEmpty>No providers found.</CommandEmpty>
                     <CommandGroup>
                        {providers.map((provider: any) => (
                           <CommandItem
                              key={provider.id}
                              value={provider.id}
                              onSelect={() => {
                                 setSelectedProvider(provider.id);
                                 setOpen(false);
                              }}
                           >
                              <Check
                                 className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedProvider === provider.id ? "opacity-100" : "opacity-0"
                                 )}
                              />
                              {provider.name + " - " + provider.id}
                           </CommandItem>
                        ))}
                     </CommandGroup>
                  </CommandList>
               </Command>
            </PopoverContent>
         </Popover>
      </>
   );
};
