import { useRef, useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { usePallets } from "@/hooks/use-pallets";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { ParcelsInPallet } from "@/components/palllets/list-parcels-in-pallet";
import { ParcelsInAgencyForPallet } from "@/components/palllets/list-parcels-in-agency";
import { ScannerCard, type ScanFeedback, type ScanMode } from "@/components/dispatch/scanner-card";

type PalletScanMode = Exclude<ScanMode, "dispatch_id">;

export const CreatePalletPage = () => {
   const { palletId } = useParams();
   const palletIdNumber = Number(palletId ?? 0);

   const [currentInput, setCurrentInput] = useState("");
   const [scanMode, setScanMode] = useState<PalletScanMode>("tracking_number");
    const [lastScanStatus, setLastScanStatus] = useState<ScanFeedback | null>(null);
  


   const inputRef = useRef<HTMLInputElement>(null);
   const agency_id = useAppStore.getState().agency?.id;

   const { mutate: addItem, isPending: isAddingParcel } = usePallets.addParcel(palletIdNumber, agency_id ?? 0);
   const { mutate: addParcelsByOrderId, isPending: isAddingByOrder } = usePallets.addParcelsByOrderId(
      palletIdNumber,
      agency_id ?? 0
   );
   const isAdding = isAddingParcel || isAddingByOrder;

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
                     error?.response?.status === 409;

                  if (isDuplicateError) {
                     setLastScanStatus({
                        tracking_number: scannedId,
                        status: "duplicate",
                        errorMessage,
                     });
                  } else {
                     toast.error(errorMessage);
                     setLastScanStatus({
                        tracking_number: scannedId,
                        status: "surplus",
                        errorMessage,
                     });
                  }
               },
            }
         );
      } else {
         const orderId = Number(inputValue);
         if (isNaN(orderId)) {
            toast.error("El ID de orden debe ser un número");
            return;
         }

         addParcelsByOrderId(
            { orderId },
            {
               onSuccess: (data: any) => {
                  const added = data?.added ?? 0;
                  const skipped = data?.skipped ?? 0;
                  setLastScanStatus({
                     tracking_number: `Orden #${orderId}`,
                     status: "matched",
                     count: added,
                  });
                  const skippedSuffix = skipped > 0 ? `, ${skipped} omitido(s)` : "";
                  toast.success(`${added} paquete(s) agregado(s) al pallet${skippedSuffix}`);
               },
               onError: (error: any) => {
                  const errorMessage = error?.response?.data?.message || error?.message || "Error al agregar paquetes";
                  toast.error(errorMessage);
                  setLastScanStatus({
                     tracking_number: `Orden #${orderId}`,
                     status: "surplus",
                     errorMessage,
                  });
               },
            }
         );
      }

      setCurrentInput("");
      inputRef.current?.focus();
   };

   return (
      <div className="flex flex-col p-2 md:p-4">
         <main className="flex-1">
            <div className="flex flex-col">
               <h3 className=" font-bold">Pallet</h3>
               <p className="text-sm text-gray-500 "> Agregar paquetes al pallet</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
               <div className="lg:col-span-2 flex flex-col gap-6">
                  <ScannerCard
                     value={currentInput}
                     onChange={setCurrentInput}
                     onScan={handleScan}
                     lastScanStatus={lastScanStatus}
                     isLoading={isAdding}
                     scanMode={scanMode}
                     onScanModeChange={(mode) =>
                        setScanMode(mode === "dispatch_id" ? "tracking_number" : mode)
                     }
                     showScanMode={true}
                  />

                  <ParcelsInPallet palletId={palletIdNumber} />
               </div>

               <ParcelsInAgencyForPallet />
            </div>
         </main>
      </div>
   );
};
