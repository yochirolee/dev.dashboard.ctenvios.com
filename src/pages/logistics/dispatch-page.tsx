import { useDispatches } from "@/hooks/use-dispatches";
import { DataTable } from "@/components/ui/data-table";
import { dispatchColumns } from "./Dispatch/dispatch-columns";
import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
export const DispatchPage = () => {
   const { data, isLoading } = useDispatches.get();

   const dispatches = data?.rows ?? [];
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 25,
   });

   if (isLoading) return <div>Loading...</div>;
   if (!data) return <div>No data</div>;
   console.log(dispatches);
   return (
      <div>
         <h1>Dispatch Page</h1>
         <div>
            <DataTable
               columns={dispatchColumns}
               data={{ rows: dispatches || [], total: dispatches.length }}
               pagination={pagination}
               setPagination={setPagination}
               isLoading={isLoading}
            />
         </div>
      </div>
   );
};
