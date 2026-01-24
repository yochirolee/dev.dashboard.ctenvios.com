import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { ButtonGroup } from "@/components/ui/button-group";
import {
   Package,
   ArrowLeft,
   Send,
   X,
   Plus,
   Search,
   PackageCheck,
   Box,
} from "lucide-react";

import { useDispatches } from "@/hooks/use-dispatches";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";
import { parcelStatus } from "@/data/types";
import { axiosInstance } from "@/api/api";
import { ScannerCard, type ScanFeedback, type ScanStatus } from "@/components/dispatch/scanner-card";
import { DispatchStats } from "@/components/dispatch/dispatch-stats";
import { Badge } from "@/components/ui/badge";
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { VirtualizedParcelTable } from "@/components/parcels/virtualized-parcel-table";

interface ScannedParcel {
   tracking_number: string;
   status: ScanStatus;
   dispatch_id?: number;
   description?: string;
   order_id?: number;
}

interface LoadedDispatch {
   id: number;
   sender_agency?: { name: string };
   status?: string;
   parcels: Array<{
      tracking_number: string;
      description?: string;
      status: string;
      order_id?: number;
   }>;
}

export const ReceiveDispatchPage = (): React.ReactElement => {
   const navigate = useNavigate();

   // Scanner state
   const [currentInput, setCurrentInput] = useState("");
   const [scannedParcels, setScannedParcels] = useState<ScannedParcel[]>([]);
   const [lastScanStatus, setLastScanStatus] = useState<ScanFeedback | null>(null);

   // Dispatch loading state
   const [dispatchIdInput, setDispatchIdInput] = useState("");
   const [loadedDispatches, setLoadedDispatches] = useState<LoadedDispatch[]>([]);
   const [isLoadingDispatch, setIsLoadingDispatch] = useState(false);

   // Filters
   const [searchTerm, setSearchTerm] = useState("");

   // Mutations
   const smartReceiveMutation = useDispatches.smartReceive();

   // Get all expected parcels from all loaded dispatches (non-received ones)
   const allExpectedParcels = useMemo(() => {
      const parcels: Array<{ tracking_number: string; dispatch_id: number; description?: string; order_id?: number }> = [];
      loadedDispatches.forEach((dispatch) => {
         dispatch.parcels
            .filter((p) => p.status !== parcelStatus.RECEIVED_IN_DISPATCH)
            .forEach((p) => {
               parcels.push({
                  tracking_number: p.tracking_number,
                  dispatch_id: dispatch.id,
                  description: p.description,
                  order_id: p.order_id,
               });
            });
      });
      return parcels;
   }, [loadedDispatches]);

   // Get already received parcels from loaded dispatches
   const alreadyReceivedParcels = useMemo(() => {
      const parcels: Array<{ tracking_number: string; dispatch_id: number }> = [];
      loadedDispatches.forEach((dispatch) => {
         dispatch.parcels
            .filter((p) => p.status === parcelStatus.RECEIVED_IN_DISPATCH)
            .forEach((p) => {
               parcels.push({
                  tracking_number: p.tracking_number,
                  dispatch_id: dispatch.id,
               });
            });
      });
      return parcels;
   }, [loadedDispatches]);

   // Missing parcels (expected but not scanned)
   const missingParcels = useMemo(() => {
      return allExpectedParcels.filter(
         (p) => !scannedParcels.some((s) => s.tracking_number === p.tracking_number)
      );
   }, [allExpectedParcels, scannedParcels]);

   // Counts
   const totalScanned = scannedParcels.length;
   const totalMissing = missingParcels.length;
   const matchedCount = scannedParcels.filter((p) => p.status === "matched").length;
   const surplusCount = scannedParcels.filter((p) => p.status === "surplus").length;

   // Calculate stats
   const stats = useMemo(() => {
      const totalExpected = allExpectedParcels.length + alreadyReceivedParcels.length;
      return {
         matched: matchedCount,
         surplus: surplusCount,
         declared: totalExpected,
         missing: totalMissing,
         alreadyReceived: alreadyReceivedParcels.length,
      };
   }, [matchedCount, surplusCount, allExpectedParcels, alreadyReceivedParcels, totalMissing]);

   // Filtered scanned parcels
   const filteredScannedParcels = useMemo(() => {
      if (!searchTerm) return scannedParcels;
      const normalized = searchTerm.toLowerCase();
      return scannedParcels.filter(
         (p) =>
            p.tracking_number.toLowerCase().includes(normalized) ||
            p.description?.toLowerCase().includes(normalized) ||
            String(p.order_id ?? "").includes(normalized)
      );
   }, [scannedParcels, searchTerm]);

   // Filtered missing parcels
   const filteredMissingParcels = useMemo(() => {
      if (!searchTerm) return missingParcels;
      const normalized = searchTerm.toLowerCase();
      return missingParcels.filter(
         (p) =>
            p.tracking_number.toLowerCase().includes(normalized) ||
            p.description?.toLowerCase().includes(normalized) ||
            String(p.order_id ?? "").includes(normalized)
      );
   }, [missingParcels, searchTerm]);

   // Transform scanned parcels for VirtualizedParcelTable
   const scannedForTable = useMemo(() => {
      return filteredScannedParcels.map((p, idx) => ({
         id: idx,
         tracking_number: p.tracking_number,
         hbl: p.tracking_number,
         order_id: p.order_id ?? 0,
         description: p.description,
         status: p.status === "matched" ? "RECEIVED_IN_DISPATCH" : "SURPLUS",
         dispatch_id: p.dispatch_id,
      }));
   }, [filteredScannedParcels]);

   // Transform missing parcels for VirtualizedParcelTable
   const missingForTable = useMemo(() => {
      return filteredMissingParcels.map((p, idx) => ({
         id: idx,
         tracking_number: p.tracking_number,
         hbl: p.tracking_number,
         order_id: p.order_id ?? 0,
         description: p.description,
         status: "IN_DISPATCH",
         dispatch_id: p.dispatch_id,
      }));
   }, [filteredMissingParcels]);

   // Load dispatch by ID
   const handleLoadDispatch = async (): Promise<void> => {
      const id = parseInt(dispatchIdInput.trim(), 10);
      if (isNaN(id) || id <= 0) {
         toast.error("Ingresa un ID de despacho válido");
         return;
      }

      // Check if already loaded
      if (loadedDispatches.some((d) => d.id === id)) {
         toast.warning(`El despacho #${id} ya está cargado`);
         setDispatchIdInput("");
         return;
      }

      setIsLoadingDispatch(true);
      try {
         // Fetch dispatch parcels using the API
         const response = await axiosInstance.get(`/dispatches/${id}/parcels`, {
            params: { page: 1, limit: 500 },
         });

         const data = response.data;
         const dispatchInfo = data.dispatch || {};
         const parcels = data.rows || [];

         // Check if dispatch has parcels
         if (parcels.length === 0) {
            toast.warning(`El despacho #${id} no tiene paquetes`);
            setDispatchIdInput("");
            return;
         }

         setLoadedDispatches((prev) => [
            ...prev,
            {
               id,
               sender_agency: dispatchInfo.sender_agency,
               status: dispatchInfo.status,
               parcels: parcels.map((p: { tracking_number: string; description?: string; status: string; order_id?: number }) => ({
                  tracking_number: p.tracking_number,
                  description: p.description,
                  status: p.status,
                  order_id: p.order_id,
               })),
            },
         ]);

         toast.success(`Despacho #${id} cargado con ${parcels.length} paquete(s)`);
         setDispatchIdInput("");
      } catch (error: unknown) {
         const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
         if (axiosError?.response?.status === 404) {
            toast.error(`El despacho #${id} no existe`);
         } else {
            const message = axiosError?.response?.data?.message || "Error al cargar el despacho";
            toast.error(message);
         }
         setDispatchIdInput("");
      } finally {
         setIsLoadingDispatch(false);
      }
   };

   // Remove loaded dispatch
   const handleRemoveDispatch = (id: number): void => {
      setLoadedDispatches((prev) => prev.filter((d) => d.id !== id));
      // Remove scanned parcels that were matched to this dispatch
      setScannedParcels((prev) =>
         prev.map((p) => {
            if (p.dispatch_id === id && p.status === "matched") {
               return { ...p, status: "surplus" as ScanStatus, dispatch_id: undefined };
            }
            return p;
         })
      );
   };

   // State for scanning in progress
   const [isScanning, setIsScanning] = useState(false);

   // Handle scan
   const handleScan = async (e?: React.FormEvent): Promise<void> => {
      e?.preventDefault();
      const trackingNumber = currentInput.trim().toUpperCase();
      if (!trackingNumber || isScanning) return;

      // Check if already scanned
      const isDuplicate = scannedParcels.some((p) => p.tracking_number === trackingNumber);
      if (isDuplicate) {
         setLastScanStatus({ tracking_number: trackingNumber, status: "duplicate", description: "Ya escaneado" });
         setCurrentInput("");
         return;
      }

      // Check if already received in any loaded dispatch
      const isAlreadyReceived = alreadyReceivedParcels.some((p) => p.tracking_number === trackingNumber);
      if (isAlreadyReceived) {
         setLastScanStatus({
            tracking_number: trackingNumber,
            status: "duplicate",
            description: "Ya fue recibido anteriormente",
         });
         setCurrentInput("");
         return;
      }

      // Check if parcel is in any loaded dispatch manifest
      const expectedParcel = allExpectedParcels.find((p) => p.tracking_number === trackingNumber);

      if (expectedParcel) {
         // Matched - found in one of the loaded dispatches
         setScannedParcels((prev) => [
            ...prev,
            {
               tracking_number: trackingNumber,
               status: "matched",
               dispatch_id: expectedParcel.dispatch_id,
               description: expectedParcel.description,
               order_id: expectedParcel.order_id,
            },
         ]);
         setLastScanStatus({
            tracking_number: trackingNumber,
            status: "matched",
            description: `En despacho #${expectedParcel.dispatch_id}`,
         });
         setCurrentInput("");
      } else {
         // Not in any loaded dispatch manifest
         
         // If no dispatches loaded, just add as surplus without verification
         // (smartReceive will validate when submitting)
         if (loadedDispatches.length === 0) {
            setScannedParcels((prev) => [
               ...prev,
               {
                  tracking_number: trackingNumber,
                  status: "surplus",
               },
            ]);
            setLastScanStatus({
               tracking_number: trackingNumber,
               status: "surplus",
               description: "Sin despacho para comparar",
            });
            setCurrentInput("");
            return;
         }
         
         // Dispatches are loaded but parcel not in any manifest - verify it exists
         setIsScanning(true);
         try {
            const response = await axiosInstance.get(`/dispatches/verify-parcel/${trackingNumber}`);
            const parcelData = response.data;
            
            // Parcel exists - add as surplus
            setScannedParcels((prev) => [
               ...prev,
               {
                  tracking_number: trackingNumber,
                  status: "surplus",
                  description: parcelData.description,
                  order_id: parcelData.order_id,
               },
            ]);
            setLastScanStatus({
               tracking_number: trackingNumber,
               status: "surplus",
               description: "No está en ningún manifiesto",
            });
         } catch (error: unknown) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError?.response?.status === 404) {
               setLastScanStatus({
                  tracking_number: trackingNumber,
                  status: "not_found",
                  errorMessage: "El paquete no existe en el sistema",
               });
               toast.error(`El paquete ${trackingNumber} no existe`);
            } else {
               setLastScanStatus({
                  tracking_number: trackingNumber,
                  status: "invalid",
                  errorMessage: "Error al verificar el paquete",
               });
               toast.error("Error al verificar el paquete");
            }
         } finally {
            setIsScanning(false);
            setCurrentInput("");
         }
      }
   };

   const handleRemoveParcel = (tracking_number: string): void => {
      setScannedParcels((prev) => prev.filter((p) => p.tracking_number !== tracking_number));
   };

   const handleClearAll = (): void => {
      setScannedParcels([]);
      setLastScanStatus(null);
   };

   const handleBack = (): void => {
      navigate("/logistics/dispatch");
   };

   // Smart receive all scanned parcels
   const handleSmartReceive = (): void => {
      if (scannedParcels.length === 0) {
         toast.error("Debes escanear al menos un paquete");
         return;
      }

      const tracking_numbers = scannedParcels.map((p) => p.tracking_number);

      smartReceiveMutation.mutate(tracking_numbers, {
         onSuccess: (data) => {
            const { summary, created_dispatches, finalized_dispatches, received_in_existing, details } = data;

            if (summary.total_received > 0) {
               const messages: string[] = [];

               if (created_dispatches?.length > 0) {
                  const dispatchIds = created_dispatches
                     .map((d: { dispatch_id: number }) => `#${d.dispatch_id}`)
                     .join(", ");
                  messages.push(`Nuevos despachos creados: ${dispatchIds}`);
               }

               if (finalized_dispatches?.length > 0) {
                  const dispatchIds = finalized_dispatches
                     .map((d: { dispatch_id: number }) => `#${d.dispatch_id}`)
                     .join(", ");
                  messages.push(`Despachos finalizados: ${dispatchIds}`);
               }

               if (received_in_existing?.length > 0) {
                  const dispatchIds = received_in_existing
                     .map((d: { dispatch_id: number }) => `#${d.dispatch_id}`)
                     .join(", ");
                  messages.push(`Recibidos en despachos existentes: ${dispatchIds}`);
               }

               toast.success(`${summary.total_received} paquete(s) recibido(s)`, {
                  description: messages.join("\n"),
                  duration: 5000,
               });
            }

            if (summary.total_skipped > 0) {
               const skippedDetails = details
                  ?.filter((d: { status: string }) => d.status === "skipped")
                  .map(
                     (d: { tracking_number: string; reason?: string }) =>
                        `${d.tracking_number}: ${d.reason || "No encontrado"}`
                  )
                  .join("\n");

               toast.warning(`${summary.total_skipped} paquete(s) omitido(s)`, {
                  description: skippedDetails,
                  duration: 5000,
               });
            }

            navigate(`/logistics/dispatch`);
         },
         onError: (error: unknown) => {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError?.response?.data?.message || "Error al recibir los paquetes");
         },
      });
   };

   const hasDispatches = loadedDispatches.length > 0;
   const progressValue = stats.declared > 0 ? Math.round(((stats.matched + stats.alreadyReceived) / stats.declared) * 100) : 0;

   return (
      <div className="flex flex-col p-2 md:p-4 mx-auto w-full h-full">
         <main className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
               </Button>
               <div className="flex flex-col">
                  <h3 className="font-bold">Recibir Paquetes</h3>
                  <p className="text-sm text-muted-foreground">
                     {hasDispatches
                        ? `${loadedDispatches.length} despacho(s) cargado(s)`
                        : "Escanea paquetes - todos serán surplus sin despacho"}
                  </p>
               </div>
            </div>

            {/* ==================== DESKTOP LAYOUT (>= lg) ==================== */}
            <div className="hidden lg:grid lg:grid-cols-5 gap-6 mt-6 flex-1 min-h-0">
               {/* Left Column: Scanner + Scanned Parcels */}
               <div className="flex flex-col gap-4 col-span-3 min-h-0">
                  <ScannerCard
                     value={currentInput}
                     onChange={setCurrentInput}
                     onScan={handleScan}
                     lastScanStatus={lastScanStatus}
                     isLoading={isScanning}
                  />

                  {/* Scanned Parcels */}
                  <div className="rounded-xl border border-border/60 bg-card/60 flex-1 flex flex-col min-h-0 overflow-hidden">
                     <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                           <PackageCheck className="h-5 w-5 text-emerald-500" />
                           <span className="font-semibold">Escaneados</span>
                           <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                              {totalScanned}
                           </span>
                        </div>
                        {scannedParcels.length > 0 && (
                           <ButtonGroup>
                              <Button variant="outline" size="sm" onClick={handleClearAll}>
                                 <X className="h-4 w-4 mr-1" />
                                 Limpiar
                              </Button>
                              <Button size="sm" onClick={handleSmartReceive} disabled={smartReceiveMutation.isPending}>
                                 {smartReceiveMutation.isPending ? (
                                    <Spinner className="h-4 w-4 mr-1" />
                                 ) : (
                                    <Send className="h-4 w-4 mr-1" />
                                 )}
                                 Recibir ({totalScanned})
                              </Button>
                           </ButtonGroup>
                        )}
                     </div>
                     <div className="relative px-4 pb-2">
                        <Search className="absolute left-6 top-2 h-4 w-4 text-muted-foreground" />
                        <Input
                           placeholder="Buscar..."
                           className="pl-8 h-8 text-sm"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     {hasDispatches && (
                        <div className="px-4 max-w-md self-end">
                           <DispatchStats
                              indicators={[
                                 { label: "recibidos", value: stats.matched + stats.alreadyReceived, total: stats.declared, color: "emerald" },
                                 { label: "surplus", value: stats.surplus, color: "orange" },
                                 { label: "faltantes", value: stats.missing, color: "red" },
                              ]}
                              progressValue={progressValue}
                           />
                        </div>
                     )}
                     <div className="flex-1 min-h-0">
                        <VirtualizedParcelTable
                           data={scannedForTable}
                           isLoading={false}
                           isFetchingNextPage={false}
                           hasNextPage={false}
                           fetchNextPage={() => {}}
                           onDelete={handleRemoveParcel}
                           canDelete={true}
                           showQR={true}
                           showStatus={true}
                           showAgency={false}
                           showWeight={false}
                           showDate={false}
                           emptyMessage="Escanea paquetes para agregarlos"
                        />
                     </div>
                  </div>
               </div>

               {/* Right Column: Dispatch Loader + Missing Parcels */}
               <div className="flex flex-col col-span-2 gap-4 min-h-0">
                  {/* Dispatch Loader */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                     <Field>
                        <FieldLabel htmlFor="dispatch-id" className="flex items-center gap-1.5 text-xs">
                           <Package className="size-3.5" />
                           Cargar Despacho
                        </FieldLabel>
                        <form
                           onSubmit={(e) => {
                              e.preventDefault();
                              handleLoadDispatch();
                           }}
                        >
                           <ButtonGroup>
                              <Input
                                 id="dispatch-id"
                                 value={dispatchIdInput}
                                 onChange={(e) => setDispatchIdInput(e.target.value)}
                                 placeholder="ID del despacho"
                                 type="number"
                                 className="w-full"
                              />
                              <Button type="submit" variant="outline" disabled={isLoadingDispatch || !dispatchIdInput.trim()}>
                                 {isLoadingDispatch ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </Button>
                           </ButtonGroup>
                        </form>
                     </Field>
                     <div className="flex flex-wrap gap-1">
                        {loadedDispatches.map((dispatch) => (
                           <Item key={dispatch.id}>
                              <ItemMedia>
                                 <Package className="size-3.5" />
                              </ItemMedia>
                              <ItemContent>
                                 <ItemTitle>
                                    #{dispatch.id}
                                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">
                                       {dispatch.parcels.length} paquetes
                                    </Badge>
                                 </ItemTitle>
                              </ItemContent>
                              <ItemActions>
                                 <Button variant="ghost" size="icon" onClick={() => handleRemoveDispatch(dispatch.id)}>
                                    <X className="h-3 w-3" />
                                 </Button>
                              </ItemActions>
                           </Item>
                        ))}
                     </div>
                  </div>

                  {hasDispatches ? (
                     <div className="rounded-xl border border-border/60 bg-card/60 flex-1 flex flex-col min-h-0 overflow-hidden">
                        <VirtualizedParcelTable
                           data={missingForTable}
                           total={missingParcels.length}
                           isLoading={false}
                           isFetchingNextPage={false}
                           hasNextPage={false}
                           fetchNextPage={() => {}}
                           title="Faltantes"
                           icon={Box}
                           headerRight={
                              <Badge variant="outline">
                                 {totalMissing} paquetes
                              </Badge>
                           }
                           showIcon={false}
                           showQR={true}
                           showStatus={false}
                           showAgency={false}
                           showWeight={false}
                           showDate={false}
                           emptyMessage="Todos los paquetes han sido escaneados"
                        />
                     </div>
                  ) : (
                     <div className="rounded-xl flex-1 border border-dashed border-border/60 bg-muted/20 p-8 flex flex-col items-center justify-center text-center">
                        <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground text-sm">
                           Carga despachos para comparar paquetes.<br />
                           Sin despachos, todos los paquetes serán <span className="text-orange-500 font-medium">surplus</span>.
                        </p>
                     </div>
                  )}
               </div>
            </div>

            {/* ==================== MOBILE LAYOUT (< lg) ==================== */}
            <div className="lg:hidden flex-1 flex flex-col min-h-0">
               {/* Scanner */}
               <div className="mt-6">
                  <ScannerCard
                     value={currentInput}
                     onChange={setCurrentInput}
                     onScan={handleScan}
                     lastScanStatus={lastScanStatus}
                     isLoading={isScanning}
                  />
               </div>

               {/* Stats and actions for mobile */}
               <div className="mt-4 flex items-center justify-between gap-4">
                  {hasDispatches && (
                     <DispatchStats
                        indicators={[
                           { label: "recibidos", value: stats.matched + stats.alreadyReceived, total: stats.declared, color: "emerald" },
                           { label: "surplus", value: stats.surplus, color: "orange" },
                           { label: "faltantes", value: stats.missing, color: "red" },
                        ]}
                        progressValue={progressValue}
                     />
                  )}
                  {scannedParcels.length > 0 && (
                     <ButtonGroup>
                        <Button variant="outline" size="sm" onClick={handleClearAll}>
                           <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={handleSmartReceive} disabled={smartReceiveMutation.isPending}>
                           {smartReceiveMutation.isPending ? (
                              <Spinner className="h-4 w-4 mr-1" />
                           ) : (
                              <Send className="h-4 w-4 mr-1" />
                           )}
                           Recibir ({totalScanned})
                        </Button>
                     </ButtonGroup>
                  )}
               </div>

               {/* Dispatch loader for mobile */}
               <div className="mt-4">
                  <Field>
                     <FieldLabel htmlFor="dispatch-id-mobile" className="flex items-center gap-1.5 text-xs">
                        <Package className="size-3.5" />
                        Cargar Despacho
                     </FieldLabel>
                     <form
                        onSubmit={(e) => {
                           e.preventDefault();
                           handleLoadDispatch();
                        }}
                     >
                        <ButtonGroup>
                           <Input
                              id="dispatch-id-mobile"
                              value={dispatchIdInput}
                              onChange={(e) => setDispatchIdInput(e.target.value)}
                              placeholder="ID del despacho"
                              type="number"
                              className="w-full"
                           />
                           <Button type="submit" variant="outline" disabled={isLoadingDispatch || !dispatchIdInput.trim()}>
                              {isLoadingDispatch ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                           </Button>
                        </ButtonGroup>
                     </form>
                  </Field>
                  {loadedDispatches.length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-2">
                        {loadedDispatches.map((dispatch) => (
                           <Badge key={dispatch.id} variant="outline" className="gap-1">
                              #{dispatch.id} ({dispatch.parcels.length})
                              <button onClick={() => handleRemoveDispatch(dispatch.id)}>
                                 <X className="h-3 w-3" />
                              </button>
                           </Badge>
                        ))}
                     </div>
                  )}
               </div>

               {/* Single list for mobile */}
               <div className="flex-1 min-h-0 mt-4 border rounded-lg">
                  <VirtualizedParcelTable
                     data={[...scannedForTable, ...missingForTable]}
                     isLoading={false}
                     isFetchingNextPage={false}
                     hasNextPage={false}
                     fetchNextPage={() => {}}
                     onDelete={(tracking) => {
                        const isScanned = scannedParcels.some((p) => p.tracking_number === tracking);
                        if (isScanned) handleRemoveParcel(tracking);
                     }}
                     canDelete={(row) => scannedParcels.some((p) => p.tracking_number === row.tracking_number)}
                     showQR={false}
                     showStatus={true}
                     showAgency={false}
                     showWeight={false}
                     showDate={false}
                     emptyMessage="Escanea paquetes para agregarlos"
                  />
               </div>
            </div>
         </main>
      </div>
   );
};
