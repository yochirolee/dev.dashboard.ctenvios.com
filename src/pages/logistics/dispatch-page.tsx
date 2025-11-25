import { useDispatches } from "@/hooks/use-dispatches";
import { DataTable } from "@/components/ui/data-table";
import { dispatchColumns } from "./Dispatch/dispatch-columns";
import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {  PackageOpen, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DispatchPage = () => {
   const { data, isLoading } = useDispatches.get();
   const navigate = useNavigate();
   const dispatches = data?.rows ?? [];
   const [pagination, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 25,
   });

   if (isLoading) return <div>Loading...</div>;
   if (!data) return <div>No data</div>;
   console.log(dispatches);
   return (
      <div className="flex flex-col gap-4 w-full">
         <div className="flex w-full flex-row justify-between items-center">
            <div className="flex flex-col">
               <h3 className=" font-bold">Despachos</h3>
               <p className="text-sm text-gray-500 "> Listado de Despachos</p>
            </div>
            <ButtonGroup orientation="horizontal" className="w-fit">
               <Button variant="outline" onClick={() => navigate("/logistics/dispatch/create")}>
                  <PackagePlus size={16} />
                  <span className="hidden md:block">Crear</span>
               </Button>
               <Button variant="outline" onClick={() => navigate("/logistics/dispatch/create")}>
                  <PackageOpen size={16} />
                  <span className="hidden md:block">Recibir</span>
               </Button>
            </ButtonGroup>
         </div>
         <DataTable
            columns={dispatchColumns}
            data={{ rows: dispatches || [], total: dispatches.length }}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
         />
      </div>
   );
};
