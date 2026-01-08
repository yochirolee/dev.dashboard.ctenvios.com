import { useEffect, useRef } from "react";
import { Search, Box } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useContainers } from "@/hooks/use-containers";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

interface ParcelReadyForContainer {
   id: number;
   hbl: string;
   tracking_number: string;
   order_id: number;
   description: string;
   weight: number;
}

export const ParcelsReadyForContainer = () => {
   const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useContainers.readyForContainer(20);

   const parcels = data?.pages.flatMap((page) => page?.rows ?? []) ?? [];
   const total = data?.pages[0]?.total ?? 0;

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
               <CardTitle>Paquetes Listos para Cargar</CardTitle>
               <Badge variant="outline">Total: {total}</Badge>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
               <div className="p-2 px-4">
                  <div className="relative">
                     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Buscar Paquete..." className="pl-8" />
                  </div>
               </div>
               <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-4 space-y-2">
                     {isLoading ? (
                        <div className="flex items-center justify-center h-full py-8">
                           <Spinner />
                        </div>
                     ) : parcels.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                           No hay paquetes disponibles para cargar
                        </div>
                     ) : (
                        <>
                           {parcels.map((pkg: ParcelReadyForContainer) => (
                              <div
                                 key={pkg.id}
                                 className="flex items-center justify-between p-3 rounded-lg border bg-muted"
                              >
                                 <div className="flex items-center gap-3">
                                    <Box className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex flex-col">
                                       <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">{pkg.tracking_number || pkg.hbl}</span>
                                          <span className="text-xs text-muted-foreground">Orden: {pkg.order_id}</span>
                                       </div>
                                       {pkg.description && (
                                          <span className="text-xs text-muted-foreground line-clamp-1">
                                             {pkg.description}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    {(pkg.tracking_number || pkg.hbl) && (
                                       <div className="flex-shrink-0 p-1 bg-white rounded">
                                          <QRCode
                                             value={pkg.tracking_number || pkg.hbl}
                                             size={48}
                                             bgColor="#FFFFFF"
                                             fgColor="#000000"
                                          />
                                       </div>
                                    )}
                                    {pkg.weight && (
                                       <span className="text-xs text-muted-foreground">{pkg.weight} lbs</span>
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
               </ScrollArea>
            </CardContent>
         </Card>
      </div>
   );
};
