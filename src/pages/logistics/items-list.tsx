import { useState } from "react";
``;
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Agency, Item } from "@/data/types";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import ItemComponent from "./item";

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
      <ScrollArea className="h-[calc(100vh-10rem)] w-full">
         <div className="flex flex-col gap-2 p-4 pt-0">
            {items.map((item: Item & { agency: Agency }) => (
               <ItemComponent
                  key={item.hbl}
                  item={item as Item & { agency: Agency }}
                  selectedItem={selectedItem as (Item & { agency: Agency }) | null}
                  setSelectedItem={setSelectedItem}
               />
            ))}
         </div>
      </ScrollArea>
   );
}
