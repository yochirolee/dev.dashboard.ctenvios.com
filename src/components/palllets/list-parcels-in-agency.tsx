import { useMemo } from "react";
import { Box } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { usePallets } from "@/hooks/use-pallets";
import { VirtualizedParcelTable, type Parcel } from "@/components/parcels/virtualized-parcel-table";

export const ParcelsInAgencyForPallet = (): React.ReactElement => {
   const agency_id = useAppStore.getState().agency?.id;
   
   const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = usePallets.readyForPallet(
      agency_id ?? 0,
      100
   );

   const parcels = useMemo(
      () => data?.pages.flatMap((page) => page?.rows ?? []) ?? [],
      [data]
   ) as Parcel[];
   
   const total = data?.pages[0]?.total ?? 0;

   return (
      <div className="lg:col-span-1 flex flex-col h-full">
         <VirtualizedParcelTable
            data={parcels}
            total={total}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            title="Paquetes en la Agencia"
            icon={Box}
            showStatus={false}
            showAgency={false}
            showWeight={true}
            showDate={false}
            showOrder={true}
            canDelete={false}
            emptyMessage="No hay paquetes disponibles"
            height="h-[calc(100vh-200px)]"
         />
      </div>
   );
};
