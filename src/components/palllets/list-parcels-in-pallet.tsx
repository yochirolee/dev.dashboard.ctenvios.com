import { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Trash2Icon, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAppStore } from "@/stores/app-store";
import { usePallets } from "@/hooks/use-pallets";

interface ParcelInPallet {
   id: number;
   tracking_number: string;
   hbl: string;
   order_id: number;
   description?: string;
   status: string;
   weight?: number;
   updated_at?: string;
   agency?: {
      name: string;
   };
}

export const ParcelsInPallet = ({ palletId }: { palletId: number }) => {
   const agency_id = useAppStore.getState().agency?.id;
   const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = usePallets.getParcelsByPalletId(
      palletId,
      100
   );

   const parcelsInPallet = data?.pages.flatMap((page) => page?.rows ?? []) ?? [];
   const total = data?.pages[0]?.total ?? 0;

   const [removingTrackingNumber, setRemovingTrackingNumber] = useState<string | null>(null);
   const { mutate: removeParcel } = usePallets.removeParcel(palletId, agency_id ?? 0);

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

   const handleRemoveParcel = (tracking_number: string): void => {
      setRemovingTrackingNumber(tracking_number);
      removeParcel(
         { tracking_number },
         {
            onSuccess: () => {
               setRemovingTrackingNumber(null);
               toast.success("Paquete removido del pallet");
            },
            onError: (error: any) => {
               setRemovingTrackingNumber(null);
               toast.error(error?.response?.data?.message || "Error al remover paquete");
            },
         }
      );
   };

   console.log(parcelsInPallet);

   return (
      <Card className="flex-1 flex flex-col min-h-0">
         <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <div className="flex w-full justify-between gap-2">
               <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Pallet: {palletId}
               </CardTitle>
               <div className=" gap-2  justify-end">
                  <Badge variant="outline">Total de Paquetes: {total}</Badge>
               </div>
            </div>
         </CardHeader>
         <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
               {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                     <Spinner />
                  </div>
               ) : (
                  <div className="divide-y divide-border">
                     {parcelsInPallet.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No hay paquetes en este pallet</div>
                     ) : (
                        <>
                           {parcelsInPallet.map((pkg: ParcelInPallet) => (
                              <div
                                 key={pkg.id}
                                 className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                              >
                                 <div className="flex items-center gap-3">
                                    <div>
                                       <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                       <div className="flex flex-col gap-2">
                                          <span className="text-sm font-medium">{pkg.tracking_number || pkg.hbl}</span>
                                          <div className="flex flex-row gap-2">
                                             <Badge variant="outline">Orden: {pkg.order_id}</Badge>
                                             <Badge variant="secondary"> {pkg?.agency?.name}</Badge>
                                          </div>
                                       </div>
                                       {pkg.description ? (
                                          <span className="text-xs text-muted-foreground">{pkg.description}</span>
                                       ) : null}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end gap-1">
                                       {pkg.updated_at ? (
                                          <span className="text-xs text-muted-foreground">
                                             {format(new Date(pkg.updated_at), "dd/MM/yyyy HH:mm")}
                                          </span>
                                       ) : null}
                                       {pkg.weight ? (
                                          <span className="text-xs text-muted-foreground">{ Number(pkg.weight).toFixed(2) } lbs</span>
                                       ) : null}
                                    </div>
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
