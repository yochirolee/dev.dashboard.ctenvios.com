import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Item } from "@/data/types";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";


export function ItemsList() {
   const [selectedItem, setSelectedItem] = useState<Item | null>(null);
   const { data, isLoading } = useQuery({
      queryKey: ["items"],
      queryFn: () => api.items.get(),
   });
   if (isLoading) return <div>Loading...</div>;
   if (!data) return <div>No data</div>;
   const items = data.rows ?? [];
   return (
      <ScrollArea className="min-h-[calc(100vh-10rem)] w-full">
         <div className="flex flex-col gap-2 p-4 pt-0">
            {items.map((item: Item) => (
               <button
                  key={item.hbl}
                  className={cn(
                     "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                     selectedItem?.hbl === item.hbl && "bg-muted"
                  )}
                  onClick={() => setSelectedItem(item)}
               >
                  <div className="flex w-full flex-col gap-1">
                     <div className="flex items-center">
                        <div className="flex flex-col items-start gap-2">
                           <div className="font-semibold">{item.hbl}</div>
                           <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                        <div
                           className={cn(
                              "ml-auto text-xs",
                              selectedItem?.agency?.name === item.agency?.name
                                 ? "text-foreground"
                                 : "text-muted-foreground"
                           )}
                        >
                           {item.agency?.name}
                        </div>
                     </div>
                  </div>
               </button>
            ))}
         </div>
      </ScrollArea>
   );
}
