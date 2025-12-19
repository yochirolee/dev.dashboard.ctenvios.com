import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Shipment } from "./types";
import { shipmentColumns } from "./components/shipment-columns";
import { ShipmentsTable } from "./components/shipments-table";
import { StatusChart } from "./components/status-chart";
import {
   normalizeStatusName,
   getEffectiveStatus,
   getCurrentWarehouse,
   getAllWarehousesFromShipments,
} from "./utils/status-utils";
import { exportShipmentsToExcel } from "./utils/export-to-excel";
import { useManifests } from "./hooks/use-manifests";

const DEFAULT_AGENCY = "CARIBE AGENCIA";

export default function TrackingHmPage() {
   const [agencyName, setAgencyName] = useState<string>(DEFAULT_AGENCY);
   const [selectedManifest, setSelectedManifest] = useState<string>("");
   const [searchQuery, setSearchQuery] = useState<string>("");
   const [statusFilter, setStatusFilter] = useState<string>("all");
   const [warehouseFilter, setWarehouseFilter] = useState<string>("all");

   const { data: manifestsData, isLoading: isLoadingManifests } = useManifests.getByAgency(agencyName);
   const { data: historyData, isLoading: isLoadingHistory } = useManifests.getHistory(selectedManifest);

   const sortedManifests = useMemo(() => {
      const manifests = manifestsData?.datos || [];
      return [...manifests]
         .map((m) => m.manifiesto.trim())
         .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
   }, [manifestsData]);

   const allShipments = historyData?.envios || [];

   const filteredShipments = useMemo(() => {
      let filtered: Shipment[] = [...allShipments];

      // Filter by effective status (considering last event)
      if (statusFilter !== "all") {
         filtered = filtered.filter((shipment) => {
            const effectiveStatus = getEffectiveStatus(shipment);
            return effectiveStatus === statusFilter;
         });
      }

      // Filter by warehouse
      if (warehouseFilter !== "all") {
         filtered = filtered.filter((shipment) => {
            const currentWarehouse = getCurrentWarehouse(shipment);
            return currentWarehouse === warehouseFilter;
         });
      }

      // Filter by search query (code, recipient)
      if (searchQuery.trim()) {
         const query = searchQuery.toLowerCase().trim();
         filtered = filtered.filter(
            (shipment) =>
               shipment.envio.codigo.toLowerCase().includes(query) ||
               shipment.envio.destinatario.toLowerCase().includes(query)
         );
      }

      return filtered;
   }, [allShipments, statusFilter, warehouseFilter, searchQuery]);

   const uniqueStatuses = useMemo(() => {
      const statuses = new Set<string>();
      allShipments.forEach((shipment) => {
         const effectiveStatus = getEffectiveStatus(shipment);
         if (effectiveStatus) {
            statuses.add(effectiveStatus);
         }
      });
      return Array.from(statuses).sort();
   }, [allShipments]);

   const uniqueWarehouses = useMemo(() => {
      // Solo mostrar almacenes si hay un manifiesto seleccionado Y hay datos cargados
      if (!selectedManifest || !historyData || allShipments.length === 0) {
         return [];
      }
      // Extraer todos los almacenes únicos del historial completo de todos los envíos del manifiesto actual
      return getAllWarehousesFromShipments(allShipments);
   }, [allShipments, selectedManifest, historyData]);

   // Resetear el filtro de almacén si el valor seleccionado no existe en los almacenes del manifiesto actual
   useEffect(() => {
      if (warehouseFilter !== "all" && uniqueWarehouses.length > 0 && !uniqueWarehouses.includes(warehouseFilter)) {
         setWarehouseFilter("all");
      }
   }, [warehouseFilter, uniqueWarehouses]);

   const handleManifestSelect = (manifestCode: string): void => {
      setSelectedManifest(manifestCode);
      setSearchQuery("");
      setStatusFilter("all");
      setWarehouseFilter("all");
   };

   const handleClearFilters = (): void => {
      setSearchQuery("");
      setStatusFilter("all");
      setWarehouseFilter("all");
   };

   const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all" || warehouseFilter !== "all";

   return (
      <div className="flex h-full flex-col gap-4 p-4 lg:p-6">
         <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Tracking HM</h1>
            <p className="text-muted-foreground">Consulta el historial de manifiestos y envíos</p>
         </div>

         <Card>
            <CardHeader>
               <CardTitle>Agencia</CardTitle>
               <CardDescription>Selecciona la agencia para listar los manifiestos</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-2">
                  <Label htmlFor="agency">Nombre de la agencia</Label>
                  <Input
                     id="agency"
                     value={agencyName}
                     onChange={(e) => {
                        setAgencyName(e.target.value);
                        setSelectedManifest("");
                     }}
                     placeholder="Ej: CARIBE AGENCIA"
                  />
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle>Manifiesto</CardTitle>
               <CardDescription>
                  {sortedManifests.length > 0
                     ? `${sortedManifests.length} manifiestos encontrados`
                     : "Selecciona una agencia"}
               </CardDescription>
            </CardHeader>
            <CardContent>
               {isLoadingManifests ? (
                  <div className="flex items-center justify-center p-8">
                     <div className="text-muted-foreground">Cargando manifiestos...</div>
                  </div>
               ) : sortedManifests.length > 0 ? (
                  <div className="space-y-2">
                     <Label htmlFor="manifest-select">Selecciona un manifiesto</Label>
                     <Select value={selectedManifest} onValueChange={handleManifestSelect}>
                        <SelectTrigger id="manifest-select">
                           <SelectValue placeholder="Selecciona un manifiesto" />
                        </SelectTrigger>
                        <SelectContent>
                           {sortedManifests.map((manifestCode) => (
                              <SelectItem key={manifestCode} value={manifestCode}>
                                 {manifestCode}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     {selectedManifest && historyData?.manifiesto && (
                        <div className="mt-2 text-sm text-muted-foreground">
                           Agencia: {historyData.manifiesto.agencia}
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="flex items-center justify-center p-8">
                     <div className="text-muted-foreground">No se encontraron manifiestos</div>
                  </div>
               )}
            </CardContent>
         </Card>

         {selectedManifest && (
            <>
               <div className="grid gap-4 lg:grid-cols-2">
                  <StatusChart shipments={allShipments} />
                  <Card>
                     <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                        <CardDescription>
                           {filteredShipments.length} de {allShipments.length} envíos
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                           <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                 type="search"
                                 className="pl-9"
                                 placeholder="Buscar por código o destinatario..."
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                              />
                           </div>
                           {hasActiveFilters && (
                              <Button variant="outline" size="icon" onClick={handleClearFilters} className="shrink-0">
                                 <X className="w-4 h-4" />
                              </Button>
                           )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           {uniqueStatuses.length > 0 && (
                              <div className="flex items-center gap-2">
                                 <Label htmlFor="status-filter" className="text-xs whitespace-nowrap">
                                    Estado:
                                 </Label>
                                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger id="status-filter" className="h-8 text-xs">
                                       <SelectValue placeholder="Todos los estados" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="all">Todos los estados</SelectItem>
                                       {uniqueStatuses.map((status) => (
                                          <SelectItem key={status} value={status}>
                                             {normalizeStatusName(status)}
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                              </div>
                           )}
                           {uniqueWarehouses.length > 0 && (
                              <div className="flex items-center gap-2">
                                 <Label htmlFor="warehouse-filter" className="text-xs whitespace-nowrap">
                                    Almacén:
                                 </Label>
                                 <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                                    <SelectTrigger id="warehouse-filter" className="h-8 text-xs">
                                       <SelectValue placeholder="Todos los almacenes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                       <SelectItem value="all">Todos los almacenes</SelectItem>
                                       {uniqueWarehouses.map((warehouse) => (
                                          <SelectItem key={warehouse} value={warehouse}>
                                             {warehouse}
                                          </SelectItem>
                                       ))}
                                    </SelectContent>
                                 </Select>
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               </div>

               <Card>
                  <CardHeader>
                     <div className="flex items-center justify-between">
                        <div>
                           <CardTitle>Envíos</CardTitle>
                           <CardDescription>Historial del manifiesto: {selectedManifest}</CardDescription>
                        </div>
                        {filteredShipments.length > 0 && (
                           <Button
                              variant="outline"
                              onClick={() => exportShipmentsToExcel(filteredShipments, selectedManifest)}
                              className="gap-2"
                           >
                              <Download className="w-4 h-4" />
                              Exportar a Excel
                           </Button>
                        )}
                     </div>
                  </CardHeader>
                  <CardContent>
                     <ShipmentsTable columns={shipmentColumns} data={filteredShipments} isLoading={isLoadingHistory} />
                  </CardContent>
               </Card>
            </>
         )}
      </div>
   );
}
