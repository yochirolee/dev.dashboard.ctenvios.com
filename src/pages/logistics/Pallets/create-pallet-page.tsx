import { useRef, useState } from "react";
import { Barcode, CheckCircle2, AlertTriangle, RefreshCw, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/stores/app-store";
import { usePallets } from "@/hooks/use-pallets";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { ParcelsInPallet } from "@/components/palllets/list-parcels-in-pallet";
import { ParcelsInAgencyForPallet } from "@/components/palllets/list-parcels-in-agency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ScanStatus = "matched" | "surplus" | "duplicate";
type ScanMode = "tracking_number" | "order_id";

export const CreatePalletPage = () => {
   const { palletId } = useParams();
   const palletIdNumber = Number(palletId ?? 0);

   const [currentInput, setCurrentInput] = useState("");
   const [scanMode, setScanMode] = useState<ScanMode>("tracking_number");
   const [lastScanStatus, setLastScanStatus] = useState<{
      value: string;
      status: ScanStatus;
      count?: number;
      description?: string;
      errorMessage?: string;
   } | null>(null);

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
                     value: scannedId,
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
                        value: scannedId,
                        status: "duplicate",
                        errorMessage,
                     });
                  } else {
                     toast.error(errorMessage);
                     setLastScanStatus({
                        value: scannedId,
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
                     value: `Orden #${orderId}`,
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
                     value: `Orden #${orderId}`,
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
                  <Card>
                     <CardContent>
                        <form onSubmit={(e) => handleScan(e)} className="flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                              <label className="text-sm font-medium flex items-center gap-2">
                                 {scanMode === "tracking_number" ? (
                                    <Barcode className="size-4 text-primary" />
                                 ) : (
                                    <FileText className="size-4 text-primary" />
                                 )}
                                 {scanMode === "tracking_number"
                                    ? "Scan Barcode or Qr Code"
                                    : "Agregar por ID de Orden"}
                              </label>
                              <span className="text-xs text-muted-foreground animate-pulse">Ready to scan...</span>
                           </div>
                           <div className="flex gap-2">
                              <Input
                                 ref={inputRef}
                                 value={currentInput}
                                 onChange={(e) => setCurrentInput(e.target.value)}
                              
                                 placeholder={
                                    scanMode === "tracking_number"
                                       ? "Scan or type tracking number..."
                                       : "Ingresar ID de orden..."
                                 }
                                 type={scanMode === "order_id" ? "number" : "text"}
                                 autoFocus
                              />
                              <Select value={scanMode} onValueChange={(value: ScanMode) => setScanMode(value)}>
                                 <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="tracking_number">
                                       <div className="flex items-center gap-2">
                                          <Package className="h-4 w-4" />
                                          Tracking #
                                       </div>
                                    </SelectItem>
                                    <SelectItem value="order_id">
                                       <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4" />
                                          Orden ID
                                       </div>
                                    </SelectItem>
                                 </SelectContent>
                              </Select>
                              <Button type="submit" disabled={isAdding}>
                                 {isAdding ? "Agregando..." : "Scan"}
                              </Button>
                           </div>
                        </form>

                        {lastScanStatus && (
                           <div
                              className={`mt-4 p-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                                 lastScanStatus.status === "matched"
                                    ? "bg-green-500/10 border-green-500/30 text-green-500"
                                    : lastScanStatus.status === "surplus"
                                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                                    : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                              }`}
                           >
                              {lastScanStatus.status === "matched" && <CheckCircle2 className="h-6 w-6" />}
                              {lastScanStatus.status === "surplus" && <AlertTriangle className="h-6 w-6" />}
                              {lastScanStatus.status === "duplicate" && <RefreshCw className="h-6 w-6" />}

                              <div className="flex-1">
                                 <p className="font-bold text-lg">{lastScanStatus.value}</p>
                                 {lastScanStatus.description ? (
                                    <p className="text-xs text-muted-foreground">{lastScanStatus.description}</p>
                                 ) : null}
                                 <p className="text-sm opacity-90">
                                    {lastScanStatus.status === "matched" &&
                                       (lastScanStatus.count !== undefined
                                          ? `${lastScanStatus.count} paquete(s) agregado(s)`
                                          : "Successfully verified")}
                                    {lastScanStatus.status === "surplus" &&
                                       (lastScanStatus.errorMessage || "Warning: Not available")}
                                    {lastScanStatus.status === "duplicate" &&
                                       (lastScanStatus.errorMessage || "Warning: Already scanned")}
                                 </p>
                              </div>
                           </div>
                        )}
                     </CardContent>
                  </Card>

                  <ParcelsInPallet palletId={palletIdNumber} />
               </div>

               <ParcelsInAgencyForPallet />
            </div>
         </main>
      </div>
   );
};
