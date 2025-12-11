import { useState, useRef } from "react";
import { ParcelsInDispatch } from "@/components/dispatch/list-parcels-in-dispatch";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, RefreshCw, Barcode } from "lucide-react";
import { ParcelsInAgency } from "@/components/dispatch/list-parcels-in-agency";
import { ReceiveDispatchSetup } from "./receive-dispatch-setup";
import { useDispatches } from "@/hooks/use-dispatches";
import { parcelStatus } from "@/data/types";

// Types
type ScanStatus = "matched" | "surplus" | "duplicate";

export const ReceiveDispatchPage = () => {
   const [currentInput, setCurrentInput] = useState("");
   const [dispatchId, setDispatchId] = useState<number | undefined>(undefined);

   const [lastScanStatus, setLastScanStatus] = useState<{
      hbl: string;
      tracking_number: string;
      status: ScanStatus;
      description?: string;
      errorMessage?: string;
   } | null>(null);
   const inputRef = useRef<HTMLInputElement>(null);

   const handleScan = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!currentInput.trim()) return;
   };

   const { data } = useDispatches.getParcelsByDispatchId(
      dispatchId ?? 0,
      20,
      parcelStatus.RECEIVED_IN_DISPATCH
   );

   const parcelsInDispatch = data?.pages.flatMap((page) => page?.rows ?? []) ?? [];
  
   console.log(parcelsInDispatch, "parcelsInDispatch");

   return (
      <div className="flex flex-col">
         <main className="flex-1">
            <div className="flex flex-col">
               <h3 className=" font-bold">Recibir Despacho</h3>
               <p className="text-sm text-gray-500 "> Recibir un despacho</p>
            </div>
            {parcelsInDispatch?.length !== undefined && parcelsInDispatch?.length === 0 ? (
               <ReceiveDispatchSetup setDispatchId={setDispatchId} />
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  <div className="lg:col-span-2 flex flex-col gap-6">
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
                     <ParcelsInDispatch dispatchId={dispatchId} status={parcelStatus.IN_DISPATCH} />
                  </div>

                  <ParcelsInAgency />
               </div>
            )}
         </main>
      </div>
   );
};
