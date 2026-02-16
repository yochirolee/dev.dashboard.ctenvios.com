import { useMemo, useState, useCallback } from "react";
import { CheckCircle2, Search, ArrowLeft, Printer, Send, Box, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app-store";
import { useDispatches } from "@/hooks/use-dispatches";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { dispatchStatus } from "@/data/types";
import { ScannerCard, type ScanFeedback, type ScanMode } from "@/components/dispatch/scanner-card";
import { VirtualizedParcelTable } from "@/components/parcels/virtualized-parcel-table";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export const CreateDispatchPage = (): React.ReactElement => {
   const { dispatchId } = useParams();
   const navigate = useNavigate();
   const dispatchIdNumber = Number(dispatchId ?? 0);

   // Fetch dispatch data to get status
   const { data: dispatchData } = useDispatches.getById(dispatchIdNumber);

   // State
   const [currentInput, setCurrentInput] = useState("");
   const [searchTerm, setSearchTerm] = useState("");
   const [lastScanStatus, setLastScanStatus] = useState<ScanFeedback | null>(null);
   const [removingTrackingNumber, setRemovingTrackingNumber] = useState<string | null>(null);
   const [scanMode, setScanMode] = useState<ScanMode>("tracking_number");
   const agency_id = useAppStore.getState().agency?.id;

   const { mutate: addItem, isPending: isAddingItem } = useDispatches.addParcel(dispatchIdNumber, agency_id ?? 0);
   const { mutate: addParcelsByOrderId, isPending: isAddingByOrder } = useDispatches.addParcelsByOrderId(
      dispatchIdNumber,
      agency_id ?? 0,
   );

   // Use infinite queries for parcels
   const {
      data: agencyPackagesData,
      isLoading: isLoadingAgency,
      fetchNextPage: fetchNextAgencyPage,
      hasNextPage: hasNextAgencyPage,
      isFetchingNextPage: isFetchingNextAgencyPage,
   } = useDispatches.readyForDispatch(agency_id ?? 0, 20);

   const {
      data: dispatchParcelsData,
      isLoading: isLoadingDispatchParcels,
      fetchNextPage: fetchNextDispatchPage,
      hasNextPage: hasNextDispatchPage,
      isFetchingNextPage: isFetchingNextDispatchPage,
   } = useDispatches.getParcelsByDispatchId(dispatchIdNumber, 100);

   const finalizeCreateMutation = useDispatches.finalizeCreate(dispatchIdNumber);
   const removeParcelMutation = useDispatches.removeParcel(dispatchIdNumber, agency_id ?? 0);
   const totalAdded = dispatchParcelsData?.pages?.[0]?.total ?? 0;

   const handleScan = (e?: React.FormEvent): void => {
      e?.preventDefault();
      if (!currentInput.trim()) return;

      const inputValue = currentInput.trim();

      if (scanMode === "tracking_number") {
         const scannedId = inputValue.toUpperCase();
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
                     errorMessage.toLowerCase().includes("ya está") ||
                     error?.response?.status === 409;

                  setLastScanStatus({
                     tracking_number: scannedId,
                     status: isDuplicateError ? "duplicate" : "error",
                     errorMessage,
                  });
               },
            },
         );
      } else if (scanMode === "order_id") {
         const orderId = Number(inputValue);
         if (isNaN(orderId)) {
            toast.error("El ID de orden debe ser un número");
            return;
         }

         addParcelsByOrderId(
            { orderId },
            {
               onSuccess: (data: any) => {
                  const added = data?.added || data?.length || 0;
                  setLastScanStatus({
                     tracking_number: `Orden #${orderId}`,
                     status: "matched",
                     count: added,
                  });
               },
               onError: (error: any) => {
                  const errorMessage = error?.response?.data?.message || error?.message || "Error al agregar paquetes";
                  setLastScanStatus({
                     tracking_number: `Orden #${orderId}`,
                     status: "error",
                     errorMessage,
                  });
               },
            },
         );
      } else {
         toast.error("Agregar por despacho no está disponible al crear despacho");
      }

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

   const handleRemoveParcel = useCallback(
      (tracking_number: string): void => {
         setRemovingTrackingNumber(tracking_number);
         removeParcelMutation.mutate(
            { tracking_number },
            {
               onSettled: () => {
                  setRemovingTrackingNumber(null);
               },
            },
         );
      },
      [removeParcelMutation],
   );

   // Flatten pages from infinite queries
   const agencyPackages = useMemo(
      () => agencyPackagesData?.pages?.flatMap((page) => page?.rows ?? []) ?? [],
      [agencyPackagesData],
   );

   console.log(agencyPackages, "agencyPackages");
   const dispatchParcels = useMemo(
      () => dispatchParcelsData?.pages?.flatMap((page) => page?.rows ?? []) ?? [],
      [dispatchParcelsData],
   );

   const dispatchTrackingSet = useMemo(() => {
      return new Set(dispatchParcels.map((parcel: { tracking_number: string }) => parcel.tracking_number));
   }, [dispatchParcels]);

   // Pending packages (in agency, not yet in dispatch)
   const pendingPackages = useMemo(() => {
      return agencyPackages.filter((pkg: { tracking_number: string }) => !dispatchTrackingSet.has(pkg.tracking_number));
   }, [agencyPackages, dispatchTrackingSet]);

   const canFinalize = dispatchData?.status === dispatchStatus.DRAFT || dispatchData?.status === dispatchStatus.LOADING;

   // Filter dispatch parcels based on search
   const filteredDispatchParcels = useMemo(() => {
      if (!searchTerm) return dispatchParcels;
      const normalized = searchTerm.toLowerCase();
      return dispatchParcels.filter(
         (pkg: { tracking_number: string; description?: string; order_id?: number }) =>
            pkg.tracking_number?.toLowerCase().includes(normalized) ||
            pkg.description?.toLowerCase().includes(normalized) ||
            String(pkg.order_id ?? "").includes(normalized),
      );
   }, [dispatchParcels, searchTerm]);

   // Filter pending parcels based on search
   const filteredPendingPackages = useMemo(() => {
      if (!searchTerm) return pendingPackages;
      const normalized = searchTerm.toLowerCase();
      return pendingPackages.filter(
         (pkg: { tracking_number: string; description?: string; order_id?: number }) =>
            pkg.tracking_number?.toLowerCase().includes(normalized) ||
            pkg.description?.toLowerCase().includes(normalized) ||
            String(pkg.order_id ?? "").includes(normalized),
      );
   }, [pendingPackages, searchTerm]);

   return (
      <div className="flex flex-col p-2 md:p-4 mx-auto w-full h-full">
         <main className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleBack}>
                     <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex flex-col">
                     <h3 className="font-bold">Crear Despacho</h3>
                     <p className="text-sm text-gray-500">Despacho #{dispatchIdNumber}</p>
                  </div>
               </div>
            </div>

            {/* ==================== DESKTOP LAYOUT (>= lg) ==================== */}
            <div className=" lg:grid lg:grid-cols-5 gap-6 mt-6 flex-1 min-h-0">
               {/* Left Column: Scanner + Added Parcels */}
               <div className="flex flex-col gap-4 col-span-3 min-h-0">
                  <ScannerCard
                     value={currentInput}
                     onChange={setCurrentInput}
                     onScan={handleScan}
                     lastScanStatus={lastScanStatus}
                     isLoading={isAddingItem || isAddingByOrder}
                     scanMode={scanMode}
                     onScanModeChange={setScanMode}
                     showScanMode={true}
                  />

                  {/* Added Parcels (in dispatch) */}
                  <div className="rounded-xl border border-border/60 bg-card/60 flex-1 space-y-4 flex flex-col ">
                     <div className="flex items-center justify-between p-4 ">
                        <div className="flex items-center gap-2">
                           <Send className="h-5 w-5 text-emerald-500" />
                           <span className="font-semibold">En Despacho</span>
                           <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                              {totalAdded}
                           </span>
                        </div>

                        <ButtonGroup>
                           {canFinalize && (
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={handleFinalizeDispatch}
                                 disabled={finalizeCreateMutation.isPending || totalAdded === 0}
                              >
                                 {finalizeCreateMutation.isPending ? <Spinner /> : <CheckCircle2 />}
                                 <span className="hidden lg:block">Finalizar</span>
                              </Button>
                           )}

                           <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                              <Printer className="h-4 w-4 mr-1" />
                              <span className="hidden lg:block">Imprimir</span>
                           </Button>
                        </ButtonGroup>
                     </div>

                     <div className="relative  px-4 pb-2">
                        <InputGroup>
                           <InputGroupAddon align="inline-start">
                              <Search className="h-4 w-4 mr-1" />
                           </InputGroupAddon>
                           <InputGroupInput
                              placeholder="Buscar en despacho..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                           />
                           <InputGroupAddon align="inline-end">
                              {searchTerm && <X className="h-4 w-4 mr-1" onClick={() => setSearchTerm("")} />}
                           </InputGroupAddon>
                        </InputGroup>
                     </div>

                     <div className="flex-1 min-h-0">
                        <VirtualizedParcelTable
                           data={filteredDispatchParcels}
                           isLoading={isLoadingDispatchParcels}
                           isFetchingNextPage={isFetchingNextDispatchPage}
                           hasNextPage={hasNextDispatchPage}
                           fetchNextPage={fetchNextDispatchPage}
                           onDelete={handleRemoveParcel}
                           canDelete={true}
                           removingTrackingNumber={removingTrackingNumber}
                           showQR={false}
                           showStatus={true}
                           showAgency={true}
                           showWeight={true}
                           showDate={true}
                           emptyMessage="Escanea paquetes para agregarlos"
                        />
                     </div>
                  </div>
               </div>

               {/* Right Column: Pending Parcels (in agency) */}
               <div className="rounded-xl col-span-2 border border-border/60 bg-card/60 flex flex-col min-h-0 overflow-hidden">
                  <VirtualizedParcelTable
                     data={filteredPendingPackages}
                     total={agencyPackagesData?.pages?.[0]?.total ?? 0}
                     isLoading={isLoadingAgency}
                     isFetchingNextPage={isFetchingNextAgencyPage}
                     hasNextPage={hasNextAgencyPage}
                     fetchNextPage={fetchNextAgencyPage}
                     title="En Agencia"
                     icon={Box}
                     headerRight={
                        <Badge variant="outline">{agencyPackagesData?.pages?.[0]?.total ?? 0} paquetes</Badge>
                     }
                     showIcon={false}
                     showQR={true}
                     showStatus={true}
                     showAgency={false}
                     showWeight={false}
                     showDate={true}
                     showOrder={true}
                     canDelete={false}
                     emptyMessage="Todos los paquetes han sido agregados"
                  />
               </div>
            </div>
         </main>
      </div>
   );
};
