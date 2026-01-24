import { useMemo, useCallback } from "react";
import { Layers } from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { usePallets } from "@/hooks/use-pallets";
import { toast } from "sonner";
import { VirtualizedParcelTable, type Parcel } from "@/components/parcels/virtualized-parcel-table";

export const ParcelsInPallet = ({ palletId }: { palletId: number }): React.ReactElement => {
   const agency_id = useAppStore.getState().agency?.id;
   
   const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = usePallets.getParcelsByPalletId(
      palletId,
      100
   );

   const { mutate: removeParcel } = usePallets.removeParcel(palletId, agency_id ?? 0);

   const parcelsInPallet = useMemo(
      () => data?.pages.flatMap((page) => page?.rows ?? []) ?? [],
      [data]
   ) as Parcel[];
   
   const total = data?.pages[0]?.total ?? 0;

   const handleDelete = useCallback(
      (trackingNumber: string): void => {
         removeParcel(
            { tracking_number: trackingNumber },
            {
               onSuccess: () => {
                  toast.success("Paquete removido del pallet");
               },
               onError: (error: any) => {
                  toast.error(error?.response?.data?.message || "Error al remover paquete");
               },
            }
         );
      },
      [removeParcel]
   );

   return (
      <VirtualizedParcelTable
         data={parcelsInPallet}
         total={total}
         isLoading={isLoading}
         hasNextPage={hasNextPage}
         isFetchingNextPage={isFetchingNextPage}
         fetchNextPage={fetchNextPage}
         title={`Pallet: ${palletId}`}
         icon={Layers}
         showStatus={true}
         showAgency={true}
         showWeight={true}
         showDate={true}
         showOrder={true}
         canDelete={true}
         onDelete={handleDelete}
         emptyMessage="No hay paquetes en este pallet"
      />
   );
};
