import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { CheckCircle2, Trash2Icon } from "lucide-react";
import { useDispatches } from "@/hooks/use-dispatches";
import { Button } from "../ui/button";
import { useAppStore } from "@/stores/app-store";
import { Spinner } from "../ui/spinner";
import { format } from "date-fns";
import { toast } from "sonner";
import { parcelStatus, type ParcelStatus } from "@/data/types";

type ParcelsInDispatch = {
   id: number;
   tracking_number: string;
   order_id: number;
   description?: string;
   status: ParcelStatus;
   updated_at?: Date;
};

export const ParcelsInDispatch = ({
   dispatchId,
   status,
}: {
   dispatchId: number | undefined;
   status: ParcelStatus | undefined;
}) => {
   const agency_id = useAppStore.getState().agency?.id;
   const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useDispatches.getParcelsByDispatchId(
      dispatchId ?? 0,
      20,
      status ?? parcelStatus.IN_DISPATCH
   );
   // Flatten all pages into a single array
   const parcelsInDispatch = data?.pages.flatMap((page) => page?.rows ?? []) ?? [];
   const total = data?.pages[0]?.total ?? 0;

   const [removingTrackingNumber, setRemovingTrackingNumber] = useState<string | null>(null);
   const { mutate: removeParcel } = useDispatches.removeParcel(dispatchId ?? 0, agency_id ?? 0);

   // Intersection observer for infinite scrolling
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
         { tracking_number: tracking_number },
         {
            onSuccess: () => {
               setRemovingTrackingNumber(null);
            },
            onError: () => {
               setRemovingTrackingNumber(null);
            },
         }
      );
   };
   const finishDispatchMutation = useDispatches.finishDispatch(dispatchId ?? 0);
   const handleFinishDispatch = () => {
      finishDispatchMutation.mutate(undefined, {
         onSuccess: () => {
            toast.success("Despacho finalizado correctamente");
         },
         onError: () => {
            toast.error("Error al finalizar el despacho");
         },
      });
   };
   return (
      <Card className="flex-1 flex flex-col min-h-0">
         <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <div className="flex flex-col gap-2">
               <CardTitle className="text-lg">Despacho: {dispatchId?.toString() ?? ""}</CardTitle>
               <Badge variant="outline">Total de Paquetes: {total}</Badge>
            </div>

            <Button variant="outline" disabled={total === 0} onClick={handleFinishDispatch}>
               {finishDispatchMutation.isPending ? <Spinner /> : <CheckCircle2 />}
               <span className="hidden md:block">
                  {finishDispatchMutation.isPending ? "Finalizando..." : "Finalizar Despacho"}
               </span>
            </Button>
         </CardHeader>
         <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
               {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                     <Spinner />
                  </div>
               ) : (
                  <div className="divide-y divide-border">
                     {parcelsInDispatch.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No hay paquetes escaneados</div>
                     ) : (
                        <>
                           {parcelsInDispatch.map((pkg: ParcelsInDispatch) => (
                              <div
                                 key={pkg.id}
                                 className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                              >
                                 <div className="flex items-center gap-3">
                                    <div>
                                       <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                       <div className="flex-col md:flex-row items-center gap-2">
                                          <span className=" text-sm">{pkg.tracking_number}</span>
                                          <Badge variant="outline">Orden: {pkg.order_id}</Badge>
                                       </div>
                                       <span className="text-xs text-muted-foreground">{pkg.description}</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end gap-1">
                                       <span className="text-xs text-muted-foreground">
                                          {format(pkg?.updated_at ?? new Date(), "dd/MM/yyyy HH:mm:ss")}
                                       </span>
                                       <Badge variant="outline">{pkg.status}</Badge>
                                    </div>
                                    <Button
                                       variant="ghost"
                                       size="icon"
                                       onClick={() => handleRemoveParcel(pkg.tracking_number)}
                                       disabled={removingTrackingNumber !== null}
                                    >
                                       {removingTrackingNumber === pkg.tracking_number ? <Spinner /> : <Trash2Icon />}
                                    </Button>
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
