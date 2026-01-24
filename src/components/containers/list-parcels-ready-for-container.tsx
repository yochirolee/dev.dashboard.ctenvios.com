import { useMemo } from "react";
import { Box } from "lucide-react";
import { useContainers } from "@/hooks/use-containers";
import { VirtualizedParcelTable, type Parcel } from "@/components/parcels/virtualized-parcel-table";

export const ParcelsReadyForContainer = (): React.ReactElement => {
   const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useContainers.readyForContainer(100);

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
            title="Listos para Cargar"
            icon={Box}
            showIcon={false}
            showQR={true}
            showStatus={false}
            showAgency={false}
            showWeight={true}
            showDate={false}
            showOrder={true}
            canDelete={false}
            emptyMessage="No hay paquetes disponibles para cargar"
            height="h-[calc(100vh-250px)]"
         />
      </div>
   );
};
