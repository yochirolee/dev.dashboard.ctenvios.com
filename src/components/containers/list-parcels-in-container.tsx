import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Trash2Icon, Container } from "lucide-react";
import { useContainers } from "@/hooks/use-containers";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { toast } from "sonner";

interface ParcelInContainer {
   id: number;
   tracking_number: string;
   hbl: string;
   order_id: number;
   description?: string;
   status: string;
   weight?: number;
   updated_at?: string;
}

interface ParcelsInContainerProps {
   containerId: number;
   containerName?: string;
   canModify?: boolean;
}

export const ParcelsInContainer = ({ containerId, containerName, canModify = true }: ParcelsInContainerProps) => {
   const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useContainers.getParcels(
      containerId,
      20
   );

   const parcelsInContainer = data?.pages.flatMap((page) => page?.rows ?? []) ?? [];
   const total = data?.pages[0]?.total ?? 0;

   const [removingTrackingNumber, setRemovingTrackingNumber] = useState<string | null>(null);
   const { mutate: removeParcel } = useContainers.removeParcel(containerId);

   const loadMoreRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
               fetchNextPage();
            }
         },
         { threshold: 0.1 }
      );

      if (loadMoreRef.current) {
         observer.observe(loadMoreRef.current);
      }

      return () => {
         if (loadMoreRef.current) {
            observer.unobserve(loadMoreRef.current);
         }
      };
   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

   const handleRemoveParcel = (tracking_number: string) => {
      setRemovingTrackingNumber(tracking_number);
      removeParcel(
         { trackingNumber: tracking_number },
         {
            onSuccess: () => {
               setRemovingTrackingNumber(null);
               toast.success("Paquete removido del contenedor");
            },
            onError: (error: any) => {
               setRemovingTrackingNumber(null);
               toast.error(error?.response?.data?.message || "Error al remover paquete");
            },
         }
      );
   };

   return (
      <Card className="flex-1 flex flex-col min-h-0">
         <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <div className="flex flex-col gap-2">
               <CardTitle className="text-lg flex items-center gap-2">
                  <Container className="h-5 w-5" />
                  {containerName || `Contenedor: ${containerId}`}
               </CardTitle>
               <Badge variant="outline">Total de Paquetes: {total}</Badge>
            </div>
         </CardHeader>
         <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
               {isLoading ? (
                  <div className="flex items-center justify-center h-full py-8">
                     <Spinner />
                  </div>
               ) : (
                  <div className="divide-y divide-border">
                     {parcelsInContainer.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No hay paquetes en este contenedor</div>
                     ) : (
                        <>
                           {parcelsInContainer.map((pkg: ParcelInContainer) => (
                              <div
                                 key={pkg.id}
                                 className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                              >
                                 <div className="flex items-center gap-3">
                                    <div>
                                       <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                       <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                                          <span className="text-sm font-medium">{pkg.tracking_number || pkg.hbl}</span>
                                          <Badge variant="outline">Orden: {pkg.order_id}</Badge>
                                       </div>
                                       {pkg.description && (
                                          <span className="text-xs text-muted-foreground">{pkg.description}</span>
                                       )}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end gap-1">
                                       {pkg.updated_at && (
                                          <span className="text-xs text-muted-foreground">
                                             {format(new Date(pkg.updated_at), "dd/MM/yyyy HH:mm")}
                                          </span>
                                       )}
                                       {pkg.weight && (
                                          <span className="text-xs text-muted-foreground">{pkg.weight} lbs</span>
                                       )}
                                    </div>
                                    {canModify && (
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRemoveParcel(pkg.tracking_number || pkg.hbl)}
                                          disabled={removingTrackingNumber !== null}
                                       >
                                          {removingTrackingNumber === (pkg.tracking_number || pkg.hbl) ? (
                                             <Spinner />
                                          ) : (
                                             <Trash2Icon className="h-4 w-4" />
                                          )}
                                       </Button>
                                    )}
                                 </div>
                              </div>
                           ))}
                           {hasNextPage && (
                              <div ref={loadMoreRef} className="flex justify-center py-4">
                                 {isFetchingNextPage ? (
                                    <Spinner />
                                 ) : (
                                    <Button
                                       variant="outline"
                                       onClick={() => fetchNextPage()}
                                       disabled={!hasNextPage || isFetchingNextPage}
                                    >
                                       Cargar más
                                    </Button>
                                 )}
                              </div>
                           )}
                        </>
                     )}
                  </div>
               )}
            </ScrollArea>
         </CardContent>
      </Card>
   );
};
