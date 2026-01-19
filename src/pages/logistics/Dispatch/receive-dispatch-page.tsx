import { useState, useRef, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
   CheckCircle2,
   AlertTriangle,
   RefreshCw,
   Barcode,
   Package,
   ArrowLeft,
   Send,
   X,
   PackageCheck,
   PackageMinus,
   PackagePlus,
} from "lucide-react";
import { ReceiveDispatchSetup } from "./receive-dispatch-setup";
import QRCode from "react-qr-code";

type ReceiveMode = "with-dispatch" | "without-dispatch";
import { useDispatches } from "@/hooks/use-dispatches";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { parcelStatus } from "@/data/types";

type ScanStatus = "matched" | "surplus" | "duplicate" | "verified" | "not_found" | "invalid";

interface ScannedParcel {
   tracking_number: string;
   status: ScanStatus;
   parcel_id?: number;
   description?: string;
}

export const ReceiveDispatchPage = () => {
   const navigate = useNavigate();
   const [searchParams, setSearchParams] = useSearchParams();

   // Initialize state from URL params
   const [currentInput, setCurrentInput] = useState("");
   const [dispatchId, setDispatchId] = useState<number | undefined>(() => {
      const id = searchParams.get("dispatchId");
      return id ? parseInt(id, 10) : undefined;
   });
   const [mode, setMode] = useState<ReceiveMode | null>(() => {
      const modeParam = searchParams.get("mode");
      if (modeParam === "with-dispatch" || modeParam === "without-dispatch") {
         return modeParam;
      }
      return null;
   });
   const [scannedParcels, setScannedParcels] = useState<ScannedParcel[]>([]);

   // Update URL when dispatchId or mode changes
   useEffect(() => {
      const params = new URLSearchParams();
      if (dispatchId) {
         params.set("dispatchId", String(dispatchId));
      }
      if (mode) {
         params.set("mode", mode);
      }
      setSearchParams(params, { replace: true });
   }, [dispatchId, mode, setSearchParams]);

   const [lastScanStatus, setLastScanStatus] = useState<{
      tracking_number: string;
      status: ScanStatus;
      description?: string;
   } | null>(null);

   const inputRef = useRef<HTMLInputElement>(null);

   // Get ALL parcels in the dispatch (no status filter) - also contains dispatch info
   const { data: allParcelsData, isLoading: isLoadingDispatch } = useDispatches.getParcelsByDispatchId(
      dispatchId ?? 0,
      100,
      undefined // No status filter - get all parcels
   );

   // Extract dispatch info from parcels response
   const dispatchData = allParcelsData?.pages[0]?.dispatch ?? null;

   // All parcels from the manifest
   const allDispatchParcels = useMemo(() => {
      return allParcelsData?.pages.flatMap((page) => page?.rows ?? []) ?? [];
   }, [allParcelsData]);

   // Split by status: pending vs already received
   const declaredParcels = useMemo(() => {
      return allDispatchParcels.filter((p: { status: string }) => p.status === parcelStatus.IN_DISPATCH);
   }, [allDispatchParcels]);

   const alreadyReceivedParcels = useMemo(() => {
      return allDispatchParcels.filter((p: { status: string }) => p.status === parcelStatus.RECEIVED_IN_DISPATCH);
   }, [allDispatchParcels]);

   // Previously received parcels excluding those scanned in this session (to avoid duplicates)
   const previouslyReceivedParcels = useMemo(() => {
      return alreadyReceivedParcels.filter(
         (p: { tracking_number: string }) => !scannedParcels.some((s) => s.tracking_number === p.tracking_number)
      );
   }, [alreadyReceivedParcels, scannedParcels]);

   // Mutations
   const receiveParcelMutation = useDispatches.receiveParcel(dispatchId ?? 0);
   const createFromParcelsMutation = useDispatches.createFromParcels();
   const completeReceiveMutation = useDispatches.completeReceive(dispatchId ?? 0);

   // Calculate stats for "with dispatch" mode
   const stats = useMemo(() => {
      // Use previouslyReceivedParcels to avoid double counting with scannedParcels
      const previouslyReceived = previouslyReceivedParcels.length;
      const newlyScannedMatched = scannedParcels.filter((p) => p.status === "matched").length;
      const surplus = scannedParcels.filter((p) => p.status === "surplus").length;
      const totalReceived = previouslyReceived + newlyScannedMatched;
      // Declared = total parcels in the dispatch manifest
      const declaredCount = allDispatchParcels.length;
      // Missing = pending parcels that haven't been scanned in this session
      const pendingCount = declaredParcels.filter(
         (p: { tracking_number: string }) => !scannedParcels.some((s) => s.tracking_number === p.tracking_number)
      ).length;
      return {
         matched: totalReceived,
         surplus,
         missing: pendingCount,
         declared: declaredCount,
      };
   }, [scannedParcels, declaredParcels, previouslyReceivedParcels, allDispatchParcels]);

   // Handle scan for "with dispatch" mode
   const handleScanWithDispatch = async (): Promise<void> => {
      const trackingNumber = currentInput.trim().toUpperCase();
      if (!trackingNumber || !dispatchId) return;

      // Check if already scanned in this session
      const isDuplicate = scannedParcels.some((p) => p.tracking_number === trackingNumber);
      if (isDuplicate) {
         setLastScanStatus({ tracking_number: trackingNumber, status: "duplicate", description: "Ya escaneado" });
         setCurrentInput("");
         inputRef.current?.focus();
         return;
      }

      // Check if already received previously
      const isAlreadyReceived = alreadyReceivedParcels.some(
         (p: { tracking_number: string }) => p.tracking_number === trackingNumber
      );
      if (isAlreadyReceived) {
         setLastScanStatus({
            tracking_number: trackingNumber,
            status: "duplicate",
            description: "Ya fue recibido anteriormente",
         });
         setCurrentInput("");
         inputRef.current?.focus();
         return;
      }

      // Check if it's in the manifest (pending parcels)
      const declaredParcel = declaredParcels.find(
         (p: { tracking_number: string }) => p.tracking_number === trackingNumber
      );

      try {
         // Call API to receive the parcel
         await receiveParcelMutation.mutateAsync({ tracking_number: trackingNumber });

         if (declaredParcel) {
            // Matched - it's in the manifest
            setScannedParcels((prev) => [...prev, { tracking_number: trackingNumber, status: "matched" }]);
            setLastScanStatus({ tracking_number: trackingNumber, status: "matched", description: "En el manifiesto" });
         } else {
            // Surplus - not in manifest but received
            setScannedParcels((prev) => [...prev, { tracking_number: trackingNumber, status: "surplus" }]);
            setLastScanStatus({
               tracking_number: trackingNumber,
               status: "surplus",
               description: "No está en el manifiesto (agregado como surplus)",
            });
         }
      } catch (error: any) {
         setLastScanStatus({
            tracking_number: trackingNumber,
            status: "not_found",
            description: error?.response?.data?.message || "Error al recibir el paquete",
         });
      }

      setCurrentInput("");
      inputRef.current?.focus();
   };

   // Handle scan for "without dispatch" mode
   const handleScanWithoutDispatch = (): void => {
      const trackingNumber = currentInput.trim().toUpperCase();
      if (!trackingNumber) return;

      // Check if already scanned
      const isDuplicate = scannedParcels.some((p) => p.tracking_number === trackingNumber);
      if (isDuplicate) {
         setLastScanStatus({ tracking_number: trackingNumber, status: "duplicate", description: "Ya escaneado" });
         setCurrentInput("");
         inputRef.current?.focus();
         return;
      }

      // Add parcel directly - backend will validate on dispatch creation
      setScannedParcels((prev) => [...prev, { tracking_number: trackingNumber, status: "verified" }]);
      setLastScanStatus({
         tracking_number: trackingNumber,
         status: "verified",
         description: "Agregado a la lista",
      });

      setCurrentInput("");
      inputRef.current?.focus();
   };

   const handleScan = (e?: React.FormEvent): void => {
      e?.preventDefault();
      if (!currentInput.trim()) return;

      if (mode === "with-dispatch") {
         handleScanWithDispatch();
      } else {
         handleScanWithoutDispatch();
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
      setMode(null);
      setDispatchId(undefined);
      setScannedParcels([]);
      setLastScanStatus(null);
   };

   // Create dispatch from scanned parcels (without dispatch mode)
   const handleCreateDispatch = (): void => {
      if (scannedParcels.length === 0) {
         toast.error("Debes escanear al menos un paquete");
         return;
      }

      const tracking_numbers = scannedParcels.map((p) => p.tracking_number);

      createFromParcelsMutation.mutate(tracking_numbers, {
         onSuccess: (data) => {
            const { dispatch, added, skipped, details } = data;

            if (added > 0) {
               toast.success(`Despacho #${dispatch.id} creado con ${added} paquete(s) recibido(s)`);
            }

            if (skipped > 0) {
               const skippedDetails = details
                  ?.filter((d: { status: string }) => d.status === "skipped")
                  .map(
                     (d: { tracking_number: string; reason?: string }) =>
                        `${d.tracking_number}: ${d.reason || "No encontrado"}`
                  )
                  .join("\n");

               toast.warning(`${skipped} paquete(s) omitido(s)`, {
                  description: skippedDetails,
                  duration: 5000,
               });
            }

            navigate(`/logistics/dispatch`);
         },
         onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al crear el despacho");
         },
      });
   };

   // Complete receiving the dispatch (with dispatch mode)
   const handleCompleteReceive = (): void => {
      if (!dispatchId) return;

      completeReceiveMutation.mutate(undefined, {
         onSuccess: () => {
            toast.success("Despacho recibido correctamente");
            navigate(`/logistics/dispatch`);
         },
         onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Error al completar la recepción");
         },
      });
   };

   // Show setup screen if no mode selected
   if (!mode) {
      return (
         <div className="flex flex-col p-2 md:p-4">
            <main className="flex-1">
               <div className="flex flex-col">
                  <h3 className="font-bold">Recibir Despacho</h3>
                  <p className="text-sm text-gray-500">Selecciona el modo de recepción</p>
               </div>
               <ReceiveDispatchSetup setDispatchId={setDispatchId} setMode={setMode} />
            </main>
         </div>
      );
   }

   // Loading state for dispatch data
   if (mode === "with-dispatch" && isLoadingDispatch) {
      return (
         <div className="flex flex-col p-2 md:p-4 items-center justify-center min-h-[400px]">
            <Spinner className="h-8 w-8" />
            <p className="mt-4 text-muted-foreground">Cargando despacho...</p>
         </div>
      );
   }

   const isWithDispatch = mode === "with-dispatch";

   return (
      <div className="flex flex-col p-2 md:p-4">
         <main className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={handleBack}>
                     <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col">
                     <h3 className="font-bold">
                        {isWithDispatch ? `Recibir Despacho #${dispatchId}` : "Recibir sin Despacho"}
                     </h3>
                     <p className="text-sm text-gray-500">
                        {isWithDispatch
                           ? `Agencia: ${dispatchData?.sender_agency?.name || "..."}`
                           : "Escanea paquetes para crear un nuevo despacho"}
                     </p>
                  </div>
               </div>
               {isWithDispatch && dispatchData && (
                  <Badge variant="outline" className="text-lg px-4 py-2">
                     {dispatchData.status}
                  </Badge>
               )}
            </div>

            {/* Stats for with-dispatch mode */}
            {isWithDispatch && (
               <div className="grid grid-cols-4 gap-4 mb-4">
                  <Card>
                     <CardContent className="p-4 flex items-center gap-3">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <div>
                           <p className="text-2xl font-bold">{stats.declared}</p>
                           <p className="text-xs text-muted-foreground">Declarados</p>
                        </div>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardContent className="p-4 flex items-center gap-3">
                        <PackageCheck className="h-8 w-8 text-green-500" />
                        <div>
                           <p className="text-2xl font-bold text-green-500">{stats.matched}</p>
                           <p className="text-xs text-muted-foreground">Recibidos</p>
                        </div>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardContent className="p-4 flex items-center gap-3">
                        <PackagePlus className="h-8 w-8 text-orange-500" />
                        <div>
                           <p className="text-2xl font-bold text-orange-500">{stats.surplus}</p>
                           <p className="text-xs text-muted-foreground">Surplus</p>
                        </div>
                     </CardContent>
                  </Card>
                  <Card>
                     <CardContent className="p-4 flex items-center gap-3">
                        <PackageMinus className="h-8 w-8 text-red-500" />
                        <div>
                           <p className="text-2xl font-bold text-red-500">{stats.missing}</p>
                           <p className="text-xs text-muted-foreground">Faltantes</p>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Scanner Input */}
                  <Card>
                     <CardContent>
                        <form onSubmit={handleScan} className="flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                              <label className="text-sm font-medium flex items-center gap-2">
                                 <Barcode className="size-4 text-primary" />
                                 Escanear Código de Barras o QR
                              </label>
                              <span className="text-xs text-muted-foreground animate-pulse">
                                 Listo para escanear...
                              </span>
                           </div>
                           <div className="flex gap-2">
                              <Input
                                 ref={inputRef}
                                 value={currentInput}
                                 onChange={(e) => setCurrentInput(e.target.value)}
                                 placeholder="Escanear o escribir tracking number..."
                                 autoFocus
                              />
                              <Button type="submit" onClick={handleScan}>
                                 Escanear
                              </Button>
                           </div>
                        </form>

                        {/* Last Scan Feedback */}
                        {lastScanStatus && (
                           <div
                              className={`mt-4 p-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                                 lastScanStatus.status === "matched" || lastScanStatus.status === "verified"
                                    ? "bg-green-500/10 border-green-500/30 text-green-500"
                                    : lastScanStatus.status === "surplus"
                                    ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                                    : lastScanStatus.status === "duplicate"
                                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                                    : "bg-red-500/10 border-red-500/30 text-red-500"
                              }`}
                           >
                              {(lastScanStatus.status === "matched" || lastScanStatus.status === "verified") && (
                                 <CheckCircle2 className="h-6 w-6" />
                              )}
                              {lastScanStatus.status === "surplus" && <PackagePlus className="h-6 w-6" />}
                              {lastScanStatus.status === "duplicate" && <RefreshCw className="h-6 w-6" />}
                              {(lastScanStatus.status === "not_found" || lastScanStatus.status === "invalid") && (
                                 <AlertTriangle className="h-6 w-6" />
                              )}

                              <div className="flex-1">
                                 <p className="font-bold text-lg">{lastScanStatus.tracking_number}</p>
                                 <p className="text-sm opacity-90">
                                    {lastScanStatus.description ||
                                       (lastScanStatus.status === "matched" && "Recibido correctamente") ||
                                       (lastScanStatus.status === "verified" && "Verificado") ||
                                       (lastScanStatus.status === "surplus" && "Agregado como surplus") ||
                                       (lastScanStatus.status === "duplicate" && "Ya fue escaneado") ||
                                       "Error"}
                                 </p>
                              </div>
                           </div>
                        )}
                     </CardContent>
                  </Card>

                  {/* Scanned Parcels List */}
                  <Card className="flex-1 flex flex-col min-h-0">
                     <CardHeader className="pb-2 flex flex-row justify-between items-center">
                        <div className="flex flex-col gap-2">
                           <CardTitle className="text-lg flex items-center gap-2">
                              <Package className="h-5 w-5" />
                              {isWithDispatch ? "Paquetes Recibidos" : "Paquetes Escaneados"}
                           </CardTitle>
                           <Badge variant="outline">
                              Total:{" "}
                              {isWithDispatch
                                 ? previouslyReceivedParcels.length + scannedParcels.length
                                 : scannedParcels.length}
                           </Badge>
                        </div>
                        <div className="flex gap-2">
                           {(scannedParcels.length > 0 || alreadyReceivedParcels.length > 0) && (
                              <>
                                 {scannedParcels.length > 0 && (
                                    <Button variant="outline" size="sm" onClick={handleClearAll}>
                                       <X className="h-4 w-4 mr-1" />
                                       Limpiar Nuevos
                                    </Button>
                                 )}
                                 {isWithDispatch ? (
                                    <Button
                                       onClick={handleCompleteReceive}
                                       disabled={completeReceiveMutation.isPending}
                                    >
                                       {completeReceiveMutation.isPending ? (
                                          <Spinner className="h-4 w-4 mr-2" />
                                       ) : (
                                          <CheckCircle2 className="h-4 w-4 mr-2" />
                                       )}
                                       Completar Recepción
                                    </Button>
                                 ) : (
                                    <Button
                                       onClick={handleCreateDispatch}
                                       disabled={createFromParcelsMutation.isPending}
                                    >
                                       {createFromParcelsMutation.isPending ? (
                                          <Spinner className="h-4 w-4 mr-2" />
                                       ) : (
                                          <Send className="h-4 w-4 mr-2" />
                                       )}
                                       Recibir Despacho
                                    </Button>
                                 )}
                              </>
                           )}
                        </div>
                     </CardHeader>
                     <CardContent className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-[calc(100vh-550px)]">
                           {scannedParcels.length === 0 && previouslyReceivedParcels.length === 0 ? (
                              <div className="p-8 text-center text-muted-foreground">
                                 Escanea paquetes para agregarlos a la lista
                              </div>
                           ) : (
                              <div className="divide-y divide-border">
                                 {/* Already received parcels from server (exclude ones scanned in this session) */}
                                 {isWithDispatch &&
                                    previouslyReceivedParcels.map(
                                       (
                                          pkg: { tracking_number: string; id: number; description?: string },
                                          index: number
                                       ) => (
                                          <div
                                             key={`received-${pkg.tracking_number}`}
                                             className="p-3 flex items-center justify-between bg-green-500/5"
                                          >
                                             <div className="flex items-center gap-3">
                                                <div className="text-sm font-medium text-muted-foreground w-8">
                                                   {index + 1}.
                                                </div>
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                <span className="text-sm font-medium">{pkg.tracking_number}</span>
                                                <Badge variant="outline" className="text-green-500 border-green-500/50">
                                                   Recibido
                                                </Badge>
                                                {pkg.description && (
                                                   <span className="text-xs text-muted-foreground">
                                                      {pkg.description}
                                                   </span>
                                                )}
                                             </div>
                                          </div>
                                       )
                                    )}
                                 {/* Newly scanned parcels in this session */}
                                 {scannedParcels.map((pkg, index) => (
                                    <div
                                       key={pkg.tracking_number}
                                       className={`p-3 flex items-center justify-between hover:bg-muted/50 transition-colors ${
                                          pkg.status === "matched" || pkg.status === "verified" ? "bg-green-500/5" : ""
                                       }`}
                                    >
                                       <div className="flex items-center gap-3">
                                          <div className="text-sm font-medium text-muted-foreground w-8">
                                             {previouslyReceivedParcels.length + index + 1}.
                                          </div>
                                          {(pkg.status === "matched" || pkg.status === "verified") && (
                                             <CheckCircle2 className="h-4 w-4 text-green-500" />
                                          )}
                                          {pkg.status === "surplus" && (
                                             <PackagePlus className="h-4 w-4 text-orange-500" />
                                          )}
                                          <span className="text-sm font-medium">{pkg.tracking_number}</span>
                                          {pkg.status === "surplus" && (
                                             <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                                                Surplus
                                             </Badge>
                                          )}
                                          {(pkg.status === "matched" || pkg.status === "verified") && (
                                             <Badge variant="outline" className="text-green-500 border-green-500/50">
                                                Recibido
                                             </Badge>
                                          )}
                                          {pkg.description && (
                                             <span className="text-xs text-muted-foreground">{pkg.description}</span>
                                          )}
                                       </div>
                                       <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRemoveParcel(pkg.tracking_number)}
                                       >
                                          <X className="h-4 w-4" />
                                       </Button>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </ScrollArea>
                     </CardContent>
                  </Card>
               </div>

               {/* Right side - Manifest (Faltantes) or Instructions */}
               <div className="lg:col-span-1">
                  {isWithDispatch ? (
                     <Card>
                        <CardHeader>
                           <CardTitle className="text-lg flex items-center gap-2">
                              <Package className="h-5 w-5" />
                              Faltantes (
                              {
                                 declaredParcels.filter(
                                    (p: { tracking_number: string }) =>
                                       !scannedParcels.some((s) => s.tracking_number === p.tracking_number)
                                 ).length
                              }
                              )
                           </CardTitle>
                           <p className="text-xs text-muted-foreground">Paquetes pendientes de recibir</p>
                        </CardHeader>
                        <CardContent className="p-0">
                           <ScrollArea className="h-[calc(100vh-350px)]">
                              {declaredParcels.length === 0 ? (
                                 <div className="p-4 text-center text-muted-foreground">
                                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                    Todos los paquetes han sido recibidos
                                 </div>
                              ) : (
                                 <div className="divide-y divide-border">
                                    {declaredParcels
                                       .filter((parcel: { tracking_number: string }) => {
                                          // Only show parcels not yet scanned in this session
                                          return !scannedParcels.some(
                                             (p) => p.tracking_number === parcel.tracking_number
                                          );
                                       })
                                       .map((parcel: { tracking_number: string; id: number; description?: string }) => (
                                          <div key={parcel.tracking_number} className="p-3 flex gap-3 items-center">
                                             <div className="shrink-0 p-1 bg-white rounded">
                                                <QRCode
                                                   value={parcel.tracking_number}
                                                   size={48}
                                                   bgColor="#FFFFFF"
                                                   fgColor="#000000"
                                                />
                                             </div>
                                             <div className="flex flex-col gap-1 min-w-0">
                                                <span className="text-sm font-medium truncate">
                                                   {parcel.tracking_number}
                                                </span>
                                                {parcel.description && (
                                                   <span className="text-xs text-muted-foreground truncate">
                                                      {parcel.description}
                                                   </span>
                                                )}
                                             </div>
                                          </div>
                                       ))}
                                    {declaredParcels.filter(
                                       (parcel: { tracking_number: string }) =>
                                          !scannedParcels.some((p) => p.tracking_number === parcel.tracking_number)
                                    ).length === 0 && (
                                       <div className="p-4 text-center text-muted-foreground">
                                          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                          Todos los paquetes han sido escaneados
                                       </div>
                                    )}
                                 </div>
                              )}
                           </ScrollArea>
                        </CardContent>
                     </Card>
                  ) : (
                     <Card>
                        <CardHeader>
                           <CardTitle className="text-lg">Instrucciones</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                           <div className="flex items-start gap-2">
                              <Badge variant="outline" className="shrink-0">
                                 1
                              </Badge>
                              <p>Escanea cada paquete que recibas.</p>
                           </div>
                           <div className="flex items-start gap-2">
                              <Badge variant="outline" className="shrink-0">
                                 2
                              </Badge>
                              <p>El sistema verificará que el paquete exista y sea válido.</p>
                           </div>
                           <div className="flex items-start gap-2">
                              <Badge variant="outline" className="shrink-0">
                                 3
                              </Badge>
                              <p>Revisa la lista de paquetes escaneados.</p>
                           </div>
                           <div className="flex items-start gap-2">
                              <Badge variant="outline" className="shrink-0">
                                 4
                              </Badge>
                              <p>Haz clic en "Crear Despacho" para generar el despacho con todos los paquetes.</p>
                           </div>
                        </CardContent>
                     </Card>
                  )}
               </div>
            </div>
         </main>
      </div>
   );
};
