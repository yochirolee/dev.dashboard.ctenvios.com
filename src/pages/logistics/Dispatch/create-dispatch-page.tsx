import { useMemo, useState } from "react";
import { CheckCircle2, Search, Layers, Package, PackageCheck, ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import { useDispatches } from "@/hooks/use-dispatches";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { dispatchStatus } from "@/data/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScannerCard, type ScanFeedback } from "@/components/dispatch/scanner-card";
import { ParcelItem } from "@/components/dispatch/parcel-item";
import { DispatchStats } from "@/components/dispatch/dispatch-stats";

export const CreateDispatchPage = (): React.ReactElement => {
   const { dispatchId } = useParams();
   const navigate = useNavigate();
   const dispatchIdNumber = Number(dispatchId ?? 0);

   // Fetch dispatch data to get status
   const { data: dispatchData } = useDispatches.getById(dispatchIdNumber);

   // State
   const [currentInput, setCurrentInput] = useState("");
   const [searchTerm, setSearchTerm] = useState("");
   const [activeTab, setActiveTab] = useState<"all" | "pending" | "added">("all");
   const [lastScanStatus, setLastScanStatus] = useState<ScanFeedback | null>(null);

   const agency_id = useAppStore.getState().agency?.id;

   const { mutate: addItem } = useDispatches.addItem(dispatchIdNumber, agency_id ?? 0);
   const { data: agencyPackagesData, isLoading: isLoadingAgency } = useDispatches.readyForDispatchAll(
      agency_id ?? 0,
      1000
   );
   const { data: dispatchParcelsData, isLoading: isLoadingDispatchParcels } = useDispatches.getParcelsByDispatchId(
      dispatchIdNumber,
      1000,
      undefined
   );

   const finalizeCreateMutation = useDispatches.finalizeCreate(dispatchIdNumber);

   const removeParcelMutation = useDispatches.removeParcel(dispatchIdNumber, agency_id ?? 0);

   const handleScan = (e?: React.FormEvent): void => {
      e?.preventDefault();
      if (!currentInput.trim()) return;

      const scannedId = currentInput.trim().toUpperCase();

      addItem(
         { hbl: scannedId },
         {
            onSuccess: () => {
               setLastScanStatus({
                  tracking_number: scannedId,
                  status: "matched",
               });
            },
            onError: (error: any) => {
               const errorMessage = error?.response?.data?.message || error?.message || "Error al agregar paquete";
               const isDuplicateError =
                  errorMessage.toLowerCase().includes("already") ||
                  errorMessage.toLowerCase().includes("duplicate") ||
                  errorMessage.toLowerCase().includes("ya existe") ||
                  error?.response?.status === 409;

               if (isDuplicateError) {
                  setLastScanStatus({
                     tracking_number: scannedId,
                     status: "duplicate",
                     errorMessage: errorMessage,
                  });
               } else {
                  toast.error(errorMessage);
                  setLastScanStatus({
                     tracking_number: scannedId,
                     status: "error",
                     errorMessage: errorMessage,
                  });
               }
            },
         }
      );
      setCurrentInput("");
   };

   const handleFinalizeDispatch = (): void => {
      finalizeCreateMutation.mutate(undefined, {
         onSuccess: () => {
            toast.success("Despacho finalizado correctamente");
         },
         onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "Error al finalizar el despacho";
            toast.error(errorMessage);
         },
      });
   };

   const handleDownloadPdf = (): void => {
      const apiUrl = import.meta.env.VITE_API_URL;
      window.open(`${apiUrl}/dispatches/${dispatchIdNumber}/pdf`, "_blank");
   };

   const handleBack = (): void => {
      navigate("/logistics/dispatch");
   };

   const agencyPackages = useMemo(() => agencyPackagesData?.rows ?? [], [agencyPackagesData]);
   const dispatchParcels = useMemo(() => {
      return dispatchParcelsData?.rows ?? [];
   }, [dispatchParcelsData]);

   const dispatchTrackingSet = useMemo(() => {
      return new Set(dispatchParcels.map((parcel: { tracking_number: string }) => parcel.tracking_number));
   }, [dispatchParcels]);

   const combinedPackages = useMemo(() => {
      const combined = new Map<
         string,
         {
            id: number;
            tracking_number: string;
            order_id?: number;
            description?: string;
            weight?: number;
            status?: string;
            updated_at?: string;
            source: "agency" | "dispatch";
         }
      >();

      dispatchParcels.forEach(
         (parcel: {
            id: number;
            tracking_number: string;
            order_id?: number;
            description?: string;
            weight?: number;
            status?: string;
            updated_at?: string;
         }) => {
            combined.set(parcel.tracking_number, {
               id: parcel.id,
               tracking_number: parcel.tracking_number,
               order_id: parcel.order_id,
               description: parcel.description,
               weight: parcel.weight,
               status: parcel.status,
               updated_at: parcel.updated_at,
               source: "dispatch",
            });
         }
      );

      agencyPackages.forEach(
         (pkg: { id: number; tracking_number: string; order_id?: number; description?: string; weight?: number; updated_at?: string }) => {
            if (!combined.has(pkg.tracking_number)) {
               combined.set(pkg.tracking_number, {
                  id: pkg.id,
                  tracking_number: pkg.tracking_number,
                  order_id: pkg.order_id,
                  description: pkg.description,
                  weight: pkg.weight,
                  status: undefined,
                  updated_at: pkg.updated_at,
                  source: "agency",
               });
            }
         }
      );

      return Array.from(combined.values());
   }, [agencyPackages, dispatchParcels]);

   // Pending packages (in agency, not yet in dispatch)
   const pendingPackages = useMemo(() => {
      return agencyPackages.filter(
         (pkg: { tracking_number: string }) => !dispatchTrackingSet.has(pkg.tracking_number)
      );
   }, [agencyPackages, dispatchTrackingSet]);

   // Counts
   const totalAdded = dispatchParcels.length;
   const totalPending = pendingPackages.length;
   const totalAll = combinedPackages.length;

   const filteredPackages = useMemo(() => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      return combinedPackages.filter(
         (pkg: {
            tracking_number: string;
            order_id?: number;
            description?: string;
            source: "agency" | "dispatch";
         }) => {
            const isInDispatch = dispatchTrackingSet.has(pkg.tracking_number);

            // Tab filter
            if (activeTab === "added" && !isInDispatch) return false;
            if (activeTab === "pending" && isInDispatch) return false;

            // Search filter
            if (!normalizedSearch) return true;

            return (
               pkg.tracking_number?.toLowerCase().includes(normalizedSearch) ||
               pkg.description?.toLowerCase().includes(normalizedSearch) ||
               String(pkg.order_id ?? "").includes(normalizedSearch)
            );
         }
      );
   }, [combinedPackages, dispatchTrackingSet, activeTab, searchTerm]);

   const progressValue = totalAll > 0 ? Math.round((totalAdded / totalAll) * 100) : 0;
   const canFinalize =
      dispatchData?.status === dispatchStatus.DRAFT || dispatchData?.status === dispatchStatus.LOADING;

   return (
      <div className="flex flex-col p-2 md:p-4  mx-auto w-full">
         <main className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleBack}>
                     <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col ">
                     <h3 className="font-bold">Crear Despacho</h3>
                     <p className="text-sm text-gray-500">Despacho #{dispatchIdNumber}</p>
                  </div>
               </div>
               <div className="flex items-center mr-2">
                  <div className="hidden lg:block">
                     <DispatchStats
                        indicators={[
                           { label: "en despacho", value: totalAdded, total: totalAll, color: "emerald" },
                           { label: "en agencia", value: totalPending, color: "blue" },
                        ]}
                        progressValue={progressValue}
                     />
                  </div>
                  {canFinalize && (
                     <Button onClick={handleFinalizeDispatch} disabled={finalizeCreateMutation.isPending || totalAdded === 0}>
                        {finalizeCreateMutation.isPending ? <Spinner /> : <CheckCircle2 />}
                        <span className="ml-2">Finalizar</span>
                     </Button>
                  )}
               </div>
            </div>

            {/* Mobile Stats */}
            <div className="lg:hidden mt-4">
               <DispatchStats
                  indicators={[
                     { label: "en despacho", value: totalAdded, total: totalAll, color: "emerald" },
                     { label: "en agencia", value: totalPending, color: "blue" },
                  ]}
                  progressValue={progressValue}
               />
            </div>

            {/* ==================== MOBILE LAYOUT (< lg) ==================== */}
            <div className="lg:hidden">
               <div className="mt-6">
                  <ScannerCard
                     value={currentInput}
                     onChange={setCurrentInput}
                     onScan={handleScan}
                     lastScanStatus={lastScanStatus}
                     buttonLabel="Agregar"
                  />
               </div>

               <div className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-wrap items-center gap-3">
                     <div className="relative flex-1 min-w-[180px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                           placeholder="Buscar..."
                           className="pl-8"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={() => setActiveTab("all")}
                           className={cn(
                              "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors text-xs",
                              activeTab === "all" 
                                 ? "bg-muted text-foreground" 
                                 : "text-muted-foreground"
                           )}
                        >
                           <Layers className="h-3.5 w-3.5" />
                           <span className="font-medium">Todos</span>
                           <span className="px-1.5 rounded-full bg-muted-foreground/20 font-semibold">
                              {totalAll}
                           </span>
                        </button>
                        <button
                           onClick={() => setActiveTab("pending")}
                           className={cn(
                              "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors text-xs",
                              activeTab === "pending" 
                                 ? "bg-blue-500/10 text-blue-600" 
                                 : "text-muted-foreground"
                           )}
                        >
                           <Package className="h-3.5 w-3.5" />
                           <span className="font-medium">Agencia</span>
                           <span className="px-1.5 rounded-full bg-blue-500 text-white font-semibold">
                              {totalPending}
                           </span>
                        </button>
                        <button
                           onClick={() => setActiveTab("added")}
                           className={cn(
                              "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors text-xs",
                              activeTab === "added" 
                                 ? "bg-emerald-500/10 text-emerald-600" 
                                 : "text-muted-foreground"
                           )}
                        >
                           <PackageCheck className="h-3.5 w-3.5" />
                           <span className="font-medium">Despacho</span>
                           <span className="px-1.5 rounded-full bg-emerald-500 text-white font-semibold">
                              {totalAdded}
                           </span>
                        </button>
                     </div>
                  </div>

                  <div>
                     {isLoadingAgency || isLoadingDispatchParcels ? (
                        <div className="flex items-center justify-center p-8">
                           <Spinner />
                        </div>
                     ) : filteredPackages.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                           No hay paquetes disponibles
                        </div>
                     ) : (
                        <ScrollArea className="h-[400px]">
                           {filteredPackages.map((pkg) => {
                              const isAdded = dispatchTrackingSet.has(pkg.tracking_number);
                              const statusLabel = pkg.status ?? (isAdded ? "AGREGADO" : "PENDIENTE");
                              return (
                                 <ParcelItem
                                    key={pkg.id}
                                    pkg={pkg}
                                    variant={isAdded ? "added" : "pending"}
                                    statusLabel={statusLabel}
                                    showQR={false}
                                    showWeight={false}
                                    showScanDate={false}
                                    onRemove={isAdded ? () => removeParcelMutation.mutate({ tracking_number: pkg.tracking_number }) : undefined}
                                    isRemoving={removeParcelMutation.isPending}
                                 />
                              );
                           })}
                        </ScrollArea>
                     )}
                  </div>
               </div>
            </div>

            {/* ==================== DESKTOP LAYOUT (>= lg) ==================== */}
            <div className="hidden lg:grid lg:grid-cols-5 gap-6 mt-6">
               {/* Left Column: Scanner + Added Parcels */}
               <div className="flex flex-col gap-4 col-span-3">
                  <ScannerCard
                     value={currentInput}
                     onChange={setCurrentInput}
                     onScan={handleScan}
                     lastScanStatus={lastScanStatus}
                     buttonLabel="Agregar"
                  />

                  {/* Added Parcels (in dispatch) */}
                  <div className="rounded-xl border border-border/60 bg-card/60 p-4">
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                           <PackageCheck className="h-5 w-5 text-emerald-500" />
                           <span className="font-semibold">En Despacho</span>
                           <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                              {totalAdded}
                           </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="h-8">
                           <Printer className="h-4 w-4 mr-1" />
                           Imprimir
                        </Button>
                     </div>
                     <div className="relative mb-3">
                        <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                        <Input
                           placeholder="Buscar en despacho..."
                           className="pl-8 h-8 text-sm"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                     <ScrollArea className="h-[400px]">
                        {isLoadingDispatchParcels ? (
                           <div className="flex items-center justify-center p-8">
                              <Spinner />
                           </div>
                        ) : dispatchParcels.length === 0 ? (
                           <div className="p-8 text-center text-muted-foreground">
                              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              Escanea paquetes para agregarlos
                           </div>
                        ) : (
                           dispatchParcels
                              .filter((p: { tracking_number: string }) => !searchTerm || p.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()))
                              .map((pkg: { id: number; tracking_number: string; order_id?: number; description?: string; weight?: number; status?: string; updated_at?: string }) => (
                                 <ParcelItem
                                    key={pkg.id}
                                    pkg={pkg}
                                    variant="added"
                                    statusLabel={pkg.status ?? "AGREGADO"}
                                    showQR={true}
                                    showWeight={true}
                                    showScanDate={true}
                                    onRemove={() => removeParcelMutation.mutate({ tracking_number: pkg.tracking_number })}
                                    isRemoving={removeParcelMutation.isPending}
                                 />
                              ))
                        )}
                     </ScrollArea>
                  </div>
               </div>

               {/* Right Column: Pending Parcels (in agency) */}
               <div className="rounded-xl col-span-2 border border-border/60 bg-card/60 p-4">
                  <div className="flex items-center gap-2 mb-4">
                     <Package className="h-5 w-5 text-blue-500" />
                     <span className="font-semibold">En Agencia</span>
                     <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                        {totalPending}
                     </span>
                  </div>
                  <ScrollArea className="h-[500px]">
                     {isLoadingAgency ? (
                        <div className="flex items-center justify-center p-8">
                           <Spinner />
                        </div>
                     ) : pendingPackages.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                           <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                           Todos los paquetes han sido agregados
                        </div>
                     ) : (
                        pendingPackages
                           .filter((p: { tracking_number: string }) => !searchTerm || p.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()))
                           .map((pkg: { id: number; tracking_number: string; order_id?: number; description?: string; weight?: number }) => (
                              <ParcelItem
                                 key={pkg.id}
                                 pkg={pkg}
                                 variant="pending"
                                 statusLabel="PENDIENTE"
                                 showQR={true}
                                 showWeight={true}
                                 showScanDate={false}
                              />
                           ))
                     )}
                  </ScrollArea>
               </div>
            </div>
         </main>
      </div>
   );
};
