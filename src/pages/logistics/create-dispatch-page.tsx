import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ItemsList } from "./items-list";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import type { PaginationState } from "@tanstack/react-table";

import { ReceiveDispatch } from "./Dispatch/receive-dispatch";
import type { Agency, Item, User } from "@/data/types";

export interface DispatchItem extends Item {
   id: number;
   sender_agency: Agency;
   receiver_agency: Agency;
   user: User;
   status: "PENDING" | "RECEIVED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
   weight: number;
   total_in_cents: number;
   created_at: string;
   updated_at: string;
   _count: {
      items: number;
   };
}

const useItems = () => {
   const { data, isLoading } = useQuery({
      queryKey: ["items"],
      queryFn: () => api.items.get(),
   });
   return { data, isLoading };
};

export const CreateDispatchPage = () => {
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 25,
   });
   const { data, isLoading } = useItems();
   if (isLoading) return <div>Loading...</div>;
   if (!data) return <div>No data</div>;
   return (
      <div className="grid grid-cols-12 h-full">
         <div className="col-span-12 md:col-span-3 border-r">
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
               <form>
                  <div className="relative">
                     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Search" className="pl-8" />
                  </div>
               </form>
            </div>
            <ItemsList />
         </div>
         <ReceiveDispatch
            items={data.rows}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
         />
      </div>
   );
};
