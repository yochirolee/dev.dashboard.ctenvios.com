import { Search, Box } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useAppStore } from "@/stores/app-store";
import { Spinner } from "../ui/spinner";
import { useDispatches } from "@/hooks/use-dispatches";
import QRCode from "react-qr-code";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";

export const ParcelsInAgency = () => {
   const agency_id = useAppStore.getState().agency?.id;
   const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useDispatches.readyForDispatch(
      agency_id ?? 0
   );

   // Flatten all pages into a single array
   const expectedPackages = data?.pages.flatMap((page) => page?.rows ?? []) ?? [];
   const totalInAgency = data?.pages[0]?.total ?? 0;

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

   return (
      <div className="lg:col-span-1 flex flex-col h-full">
         <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row justify-between items-center">
               <CardTitle>Paquetes en la Agencia</CardTitle>
               <Badge variant="outline">Total: {totalInAgency}</Badge>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
               <div className="p-2 px-4">
                  <div className="relative">
                     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Buscar Paquete..." className="pl-8" />
                  </div>
               </div>
               <ScrollArea className="h-[calc(100vh-100px)]">
                  <div className="p-4 space-y-2">
                     {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                           <Spinner />
                        </div>
                     ) : expectedPackages.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No hay paquetes disponibles</div>
                     ) : (
                        <>
                           {expectedPackages.map(
                              (pkg: {
                                 id: number;
                                 hbl: string;
                                 tracking_number: string;
                                 order_id: number;
                                 description: string;
                                 weight: number;
                              }) => (
                                 <div
                                    key={pkg.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-muted"
                                 >
                                    <div className="flex items-center gap-3">
                                       <Box className="h-4 w-4 text-muted-foreground" />
                                       <div className="flex flex-col">
                                          <div className="flex items-center gap-2">
                                             <span className=" text-sm">{pkg.tracking_number}</span>
                                             <span className="text-xs text-muted-foreground">
                                                Orden: {pkg.order_id}
                                             </span>
                                          </div>
                                          <span className="text-xs text-muted-foreground">{pkg.description}</span>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       {pkg.tracking_number ? (
                                          <div className="flex-shrink-0 p-1 bg-white rounded">
                                             <QRCode
                                                value={pkg.tracking_number}
                                                size={64}
                                                bgColor="#FFFFFF"
                                                fgColor="#000000"
                                             />
                                          </div>
                                       ) : null}
                                       <span className="text-xs text-muted-foreground">{pkg?.weight} lbs</span>
                                    </div>
                                 </div>
                              )
                           )}
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
               </ScrollArea>
            </CardContent>
         </Card>
      </div>
   );
};
