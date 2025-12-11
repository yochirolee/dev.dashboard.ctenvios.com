/**
 * Component Examples Using TanStack DB
 * 
 * These examples show how components automatically update when data changes.
 * No manual refetching or cache invalidation needed!
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Trash2Icon } from "lucide-react";
import { useDispatches } from "@/hooks/use-dispatches";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { useParams } from "react-router-dom";

/**
 * Example: Parcels in Dispatch Component
 * 
 * This component uses a live query, so it automatically updates when:
 * - Parcels are added (via scanning)
 * - Parcels are removed
 * - Parcel data changes
 * 
 * No useEffect, no manual refetching, no cache invalidation needed!
 */
export const ParcelsInDispatch = () => {
   const agency_id = useAppStore.getState().agency?.id;
   const { dispatchId } = useParams();
   
   // This hook uses live queries internally - automatic updates!
   const { data, isLoading } = useDispatches.getById(Number(dispatchId ?? 0));
   const parcelsInDispatch = data?.parcels ?? [];
   const total = data?._count?.parcels ?? 0;
   
   const [removingTrackingNumber, setRemovingTrackingNumber] = useState<string | null>(null);
   const { mutate: removeParcel } = useDispatches.removeParcel(
      Number(dispatchId ?? 0), 
      agency_id ?? 0
   );
   
   const handleRemoveParcel = (tracking_number: string) => {
      setRemovingTrackingNumber(tracking_number);
      removeParcel(
         { tracking_number: tracking_number },
         {
            onSuccess: () => {
               setRemovingTrackingNumber(null);
               // Component automatically updates - no need to refetch!
            },
            onError: () => {
               setRemovingTrackingNumber(null);
               // Rollback happens automatically - UI reverts to previous state
            },
         }
      );
   };

   return (
      <Card className="flex-1 flex flex-col min-h-0">
         <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg">Paquetes en Despacho</CardTitle>
            <Badge variant="outline">Total: {total}</Badge>
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
                        <div className="p-8 text-center text-muted-foreground">
                           No hay paquetes escaneados
                        </div>
                     ) : (
                        parcelsInDispatch.map((pkg) => (
                           <div
                              key={pkg.id}
                              className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                           >
                              <div className="flex items-center gap-3">
                                 <div>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                 </div>
                                 <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                       <span className="text-sm">{pkg.tracking_number}</span>
                                       <Badge variant="outline">Orden: {pkg.order_id}</Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                       {pkg.description}
                                    </span>
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
                                    {removingTrackingNumber === pkg.tracking_number ? (
                                       <Spinner />
                                    ) : (
                                       <Trash2Icon />
                                    )}
                                 </Button>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               )}
            </ScrollArea>
         </CardContent>
      </Card>
   );
};

/**
 * Example: Parcels in Agency Component
 * 
 * This also uses live queries, so it automatically updates when:
 * - Parcels are scanned (removed from this list)
 * - Parcels are removed from dispatch (added back to this list)
 */
export const ParcelsInAgency = () => {
   const agency_id = useAppStore.getState().agency?.id;
   
   // Live query - automatically updates!
   const { data, isLoading } = useDispatches.readyForDispatch(agency_id ?? 0);
   const expectedPackages = data?.rows ?? [];
   const totalInAgency = data?.total ?? 0;

   return (
      <div className="lg:col-span-1 flex flex-col h-full">
         <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row justify-between items-center">
               <CardTitle>Paquetes en la Agencia</CardTitle>
               <Badge variant="outline">Total: {totalInAgency}</Badge>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
               <ScrollArea className="h-[calc(100vh-100px)]">
                  <div className="p-4 space-y-2">
                     {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                           <Spinner />
                        </div>
                     ) : (
                        expectedPackages?.map((pkg) => (
                           <div
                              key={pkg.id}
                              className="flex items-center justify-between p-3 rounded-lg border bg-muted"
                           >
                              <div className="flex items-center gap-3">
                                 <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                       <span className="text-sm">{pkg.tracking_number}</span>
                                       <span className="text-xs text-muted-foreground">
                                          Orden: {pkg.order_id}
                                       </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                       {pkg.description}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </ScrollArea>
            </CardContent>
         </Card>
      </div>
   );
};

