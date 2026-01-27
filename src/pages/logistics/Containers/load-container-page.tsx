import { useState } from "react";
import { ParcelsInContainer } from "@/components/containers/list-parcels-in-container";
import { ParcelsReadyForContainer } from "@/components/containers/list-parcels-ready-for-container";
import { useContainers } from "@/hooks/use-containers";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { containerStatus, type ContainerStatus } from "@/data/types";
import { LockContainerState } from "@/components/containers/lock-container-state";
import { ScannerCard, type ScanFeedback, type ScanMode } from "@/components/dispatch/scanner-card";

const LOADABLE_STATUSES: ContainerStatus[] = [containerStatus.PENDING, containerStatus.LOADING];

export const LoadContainerPage = (): React.ReactElement => {
   const { containerId } = useParams();
   const containerIdNumber = Number(containerId ?? 0);

   const [currentInput, setCurrentInput] = useState("");
   const [scanMode, setScanMode] = useState<ScanMode>("tracking_number");
   const [lastScanStatus, setLastScanStatus] = useState<ScanFeedback | null>(null);

   // Fetch container details
   const { data: container, isLoading: isLoadingContainer } = useContainers.getById(containerIdNumber);

   
   // Mutations for adding parcels
   const { mutate: addParcel, isPending: isAddingParcel } = useContainers.addParcel(containerIdNumber);
   const { mutate: addParcelsByOrderId, isPending: isAddingByOrder } =
      useContainers.addParcelsByOrderId(containerIdNumber);

   const isAdding = isAddingParcel || isAddingByOrder;
   const canLoadParcels = container?.status && LOADABLE_STATUSES.includes(container.status as ContainerStatus);

   const handleScan = (e?: React.FormEvent): void => {
      e?.preventDefault();
      if (!currentInput.trim()) return;

      const inputValue = currentInput.trim();

      if (scanMode === "tracking_number") {
         const scannedId = inputValue.toUpperCase();
         addParcel(
            { trackingNumber: scannedId },
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
            }
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
            }
         );
      } else {
         const dispatchId = Number(inputValue);
         if (isNaN(dispatchId)) {
            toast.error("El ID de despacho debe ser un número");
            return;
         }

         addParcelsByOrderId(
            { dispatchId },
            {
               onSuccess: (data: any) => {
                  const added = data?.added || data?.length || 0;
                  setLastScanStatus({
                     tracking_number: `Despacho #${dispatchId}`,
                     status: "matched",
                     count: added,
                  });
               },
               onError: (error: any) => {
                  const errorMessage = error?.response?.data?.message || error?.message || "Error al agregar paquetes";
                  setLastScanStatus({
                     tracking_number: `Despacho #${dispatchId}`,
                     status: "error",
                     errorMessage,
                  });
               },
            }
         );
      }

      setCurrentInput("");
   };

   if (isLoadingContainer) {
      return (
         <div className="flex items-center justify-center h-64">
            <Spinner />
         </div>
      );
   }

   return (
      <div className="flex flex-col p-2 md:p-4">
         <main className="flex-1">
            <div className="flex flex-col">
               <h3 className="font-bold">Cargar Contenedor</h3>
               <p className="text-sm text-gray-500">Escanea paquetes para agregarlos al contenedor</p>
            </div>

            {!canLoadParcels ? (
               <LockContainerState />
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  {/* Left Column: Container Info, Scanner & Parcels in Container */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                     {/* Container Info */}

                     {/* Scanner Input Area */}
                     <ScannerCard
                        value={currentInput}
                        onChange={setCurrentInput}
                        onScan={handleScan}
                        lastScanStatus={lastScanStatus}
                        isLoading={isAdding}
                        scanMode={scanMode}
                        onScanModeChange={setScanMode}
                        showScanMode={true}
                     />

                     <ParcelsInContainer container={container} canModify={canLoadParcels} />
                  </div>

                  {/* Right Column: Parcels Ready for Container */}
                  <ParcelsReadyForContainer />
               </div>
            )}
         </main>
      </div>
   );
};
