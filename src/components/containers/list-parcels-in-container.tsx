import { useMemo, useCallback } from "react";
import { Container } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useContainers } from "@/hooks/use-containers";
import { toast } from "sonner";
import { VirtualizedParcelTable, type Parcel } from "@/components/parcels/virtualized-parcel-table";

interface ContainerType {
   id: number;
   container_name: string;
   container_number: string;
   status: string;
   container_type: string;
   origin_port: string;
   destination_port: string;
}

interface ParcelsInContainerProps {
   container: ContainerType;
   canModify?: boolean;
}

export const ParcelsInContainer = ({ container, canModify = true }: ParcelsInContainerProps): React.ReactElement => {
   const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useContainers.getParcels(
      container.id,
      100
   );
   console.log(data);

   const { mutate: removeParcel } = useContainers.removeParcel(container.id);

   const parcelsInContainer = useMemo(
      () => data?.pages.flatMap((page) => page?.rows ?? []) ?? [],
      [data]
   ) as Parcel[];
   
   const total = data?.pages[0]?.total ?? 0;

   const handleDelete = useCallback(
      (trackingNumber: string): void => {
         removeParcel(
            { trackingNumber },
            {
               onSuccess: () => {
                  toast.success("Paquete removido del contenedor");
               },
               onError: (error: any) => {
                  toast.error(error?.response?.data?.message || "Error al remover paquete");
               },
            }
         );
      },
      [removeParcel]
   );

   const headerRight = (
      <div className="flex flex-wrap items-center gap-2">
         <Badge variant="outline">{container.container_number}</Badge>
         <Badge variant="secondary">{container.status}</Badge>
         <Badge variant="outline">{container.container_type}</Badge>
         <span className="text-sm text-muted-foreground">
            {container.origin_port} → {container.destination_port}
         </span>
      </div>
   );

   return (
      <VirtualizedParcelTable
         data={parcelsInContainer}
         total={total}
         isLoading={isLoading}
         hasNextPage={hasNextPage}
         isFetchingNextPage={isFetchingNextPage}
         fetchNextPage={fetchNextPage}
         title={container.container_name || `Contenedor: ${container.id}`}
         icon={Container}
         headerRight={headerRight}
         showStatus={true}
         showAgency={true}
         showWeight={true}
         showDate={true}
         showOrder={true}
         canDelete={canModify}
         onDelete={handleDelete}
         emptyMessage="No hay paquetes en este contenedor"
      />
   );
};
