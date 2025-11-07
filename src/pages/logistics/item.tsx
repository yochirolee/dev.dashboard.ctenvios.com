import { cn } from "@/lib/utils";
import { type Agency, type Item } from "@/data/types";
import { Badge } from "@/components/ui/badge";

interface ItemComponentProps {
   item: Item & {
      agency: Agency;
   };
   selectedItem:
      | (Item & {
           agency: Agency;
        })
      | null;
   setSelectedItem: (
      item: Item & {
         agency: Agency;
      }
   ) => void;
}

export default function ItemComponent({ item, selectedItem, setSelectedItem }: ItemComponentProps) {
   return (
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
                     selectedItem?.agency?.name === item.agency?.name ? "text-foreground" : "text-muted-foreground"
                  )}
               >
                  <div className="flex flex-col items-center gap-2">
                     {item.agency?.name}
                     <Badge className="w-fit  " variant="secondary">
                        <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">{(item?.status)}</span>
                     </Badge>
                  </div>
               </div>
            </div>
         </div>
      </button>
   );
}
