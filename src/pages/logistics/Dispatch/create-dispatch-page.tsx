import { useState, useRef } from "react";
import { Barcode, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/stores/app-store";
import { ParcelsInAgency } from "@/components/dispatch/list-parcels-in-agency";
import { ParcelsInDispatch } from "@/components/dispatch/list-parcels-in-dispatch";
import { useDispatches } from "@/hooks/use-dispatches";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { parcelStatus, type DispatchStatus } from "@/data/types";

// Types
type ScanStatus = "matched" | "surplus" | "duplicate";

export const CreateDispatchPage = (): React.ReactElement => {
   const { dispatchId } = useParams();
   const dispatchIdNumber = Number(dispatchId ?? 0);

   // Fetch dispatch data to get status
   const { data: dispatchData } = useDispatches.getById(dispatchIdNumber);

   // State
   const [currentInput, setCurrentInput] = useState("");
   const [lastScanStatus, setLastScanStatus] = useState<{
      hbl: string;
      tracking_number: string;
      status: ScanStatus;
      description?: string;
      errorMessage?: string;
   } | null>(null);

   const inputRef = useRef<HTMLInputElement>(null);

   const agency_id = useAppStore.getState().agency?.id;

   const { mutate: addItem } = useDispatches.addItem(dispatchIdNumber, agency_id ?? 0);

   const handleScan = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!currentInput.trim()) return;

      const scannedId = currentInput.trim().toUpperCase();

      addItem(
         { hbl: scannedId },
         {
            onSuccess: () => {
               setLastScanStatus({
                  hbl: scannedId,
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
                  error?.response?.status === 409; // Conflict status code

               if (isDuplicateError) {
                  // Show warning with error message for duplicates
                  setLastScanStatus({
                     hbl: scannedId,
                     tracking_number: scannedId,
                     status: "duplicate",
                     errorMessage: errorMessage,
                  });
               } else {
                  // Show toast and status for other errors
                  toast.error(errorMessage);
                  setLastScanStatus({
                     hbl: scannedId,
                     tracking_number: scannedId,
                     status: "surplus",
                     errorMessage: errorMessage,
                  });
               }
            },
         }
      );
      setCurrentInput("");
      inputRef.current?.focus();
   };

   return (
      <div className="flex flex-col p-2 md:p-4">
         <main className="flex-1">
            <div className="flex flex-col">
               <h3 className=" font-bold">Crear Despacho</h3>
               <p className="text-sm text-gray-500 "> Crear un nuevo despacho</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
               {/* Left Column: Scanning & Stats */}
               <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Stats Cards */}

                  {/* Scanner Input Area */}
                  <Card>
                     <CardContent>
                        <form onSubmit={(e) => handleScan(e)} className="flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                              <label className="text-sm font-medium flex items-center gap-2">
                                 <Barcode className="size-4 text-primary" />
                                 Scan Barcode or Qr Code
                              </label>
                              <span className="text-xs text-muted-foreground animate-pulse">Ready to scan...</span>
                           </div>
                           <div className="flex gap-2">
                              <Input
                                 ref={inputRef}
                                 value={currentInput}
                                 onChange={(e) => setCurrentInput(e.target.value)}
                                 placeholder="Scan or type package ID..."
                                 autoFocus
                              />
                              <Button type="submit">Scan</Button>
                           </div>
                        </form>

                        {/* Last Scan Feedback */}
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
                                 <p className="font-bold text-lg">{lastScanStatus.hbl}</p>
                                 {lastScanStatus.description && (
                                    <p className="text-xs text-muted-foreground">{lastScanStatus.description}</p>
                                 )}
                                 <p className="text-sm opacity-90">
                                    {lastScanStatus.status === "matched" && "Successfully verified"}
                                    {lastScanStatus.status === "surplus" &&
                                       (lastScanStatus.errorMessage || "Warning: Not in manifest")}
                                    {lastScanStatus.status === "duplicate" &&
                                       (lastScanStatus.errorMessage || "Warning: Already scanned")}
                                 </p>
                              </div>
                           </div>
                        )}
                     </CardContent>
                  </Card>

                  {/* Recent Activity Log */}
                  <ParcelsInDispatch
                     dispatchId={Number(dispatchId)}
                     status={parcelStatus.IN_DISPATCH}
                     dispatchStatus={dispatchData?.status as DispatchStatus}
                  />
               </div>

               <ParcelsInAgency />
            </div>
         </main>
      </div>
   );
};
