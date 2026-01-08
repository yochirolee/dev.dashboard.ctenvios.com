import { useState, useRef } from "react";
import { Barcode, CheckCircle2, AlertTriangle, RefreshCw, Container, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParcelsInContainer } from "@/components/containers/list-parcels-in-container";
import { ParcelsReadyForContainer } from "@/components/containers/list-parcels-ready-for-container";
import { useContainers } from "@/hooks/use-containers";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { containerStatus, type ContainerStatus } from "@/data/types";
import { LockContainerState } from "@/components/containers/lock-container-state";

const LOADABLE_STATUSES: ContainerStatus[] = [containerStatus.PENDING, containerStatus.LOADING];

type ScanStatus = "matched" | "surplus" | "duplicate";
type ScanMode = "tracking_number" | "order_id";

export const LoadContainerPage = () => {
   const { containerId } = useParams();
   const containerIdNumber = Number(containerId ?? 0);

   const [currentInput, setCurrentInput] = useState("");
   const [scanMode, setScanMode] = useState<ScanMode>("tracking_number");
   const [lastScanStatus, setLastScanStatus] = useState<{
      value: string;
      status: ScanStatus;
      description?: string;
      errorMessage?: string;
      count?: number;
   } | null>(null);

   const inputRef = useRef<HTMLInputElement>(null);

   // Fetch container details
   const { data: container, isLoading: isLoadingContainer } = useContainers.getById(containerIdNumber);

   // Mutations for adding parcels
   const { mutate: addParcel, isPending: isAddingParcel } = useContainers.addParcel(containerIdNumber);
   const { mutate: addParcelsByOrderId, isPending: isAddingByOrder } =
      useContainers.addParcelsByOrderId(containerIdNumber);

   const isAdding = isAddingParcel || isAddingByOrder;
   const canLoadParcels = container?.status && LOADABLE_STATUSES.includes(container.status as ContainerStatus);

   const handleScan = (e?: React.FormEvent) => {
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
                     value: scannedId,
                     status: "matched",
                  });
                  toast.success("Paquete agregado al contenedor");
               },
               onError: (error: any) => {
                  const errorMessage = error?.response?.data?.message || error?.message || "Error al agregar paquete";
                  const isDuplicateError =
                     errorMessage.toLowerCase().includes("already") ||
                     errorMessage.toLowerCase().includes("duplicate") ||
                     errorMessage.toLowerCase().includes("ya existe") ||
                     errorMessage.toLowerCase().includes("ya está") ||
                     error?.response?.status === 409;

                  if (isDuplicateError) {
                     setLastScanStatus({
                        value: scannedId,
                        status: "duplicate",
                        errorMessage: errorMessage,
                     });
                  } else {
                     toast.error(errorMessage);
                     setLastScanStatus({
                        value: scannedId,
                        status: "surplus",
                        errorMessage: errorMessage,
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
                  const added = data?.added || data?.length || 0;
                  setLastScanStatus({
                     value: `Orden #${orderId}`,
                     status: "matched",
                     count: added,
                  });
                  toast.success(`${added} paquete(s) agregado(s) al contenedor`);
               },
               onError: (error: any) => {
                  const errorMessage = error?.response?.data?.message || error?.message || "Error al agregar paquetes";
                  toast.error(errorMessage);
                  setLastScanStatus({
                     value: `Orden #${orderId}`,
                     status: "surplus",
                     errorMessage: errorMessage,
                  });
               },
            }
         );
      }

      setCurrentInput("");
      inputRef.current?.focus();
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
                     <Card>
                        <CardHeader className="pb-2">
                           <CardTitle className="text-lg flex items-center gap-2">
                              <Container className="h-5 w-5" />
                              {container?.container_name}
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="outline">{container?.container_number}</Badge>
                              <Badge variant="secondary">{container?.status}</Badge>
                              <Badge variant="outline">{container?.container_type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                 {container?.origin_port} → {container?.destination_port}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                 {container?._count?.parcels || 0} paquetes
                              </span>
                           </div>
                        </CardContent>
                     </Card>

                     {/* Scanner Input Area */}
                     <Card>
                        <CardContent className="pt-6">
                           <form onSubmit={(e) => handleScan(e)} className="flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                 <label className="text-sm font-medium flex items-center gap-2">
                                    {scanMode === "tracking_number" ? (
                                       <Barcode className="size-4 text-primary" />
                                    ) : (
                                       <FileText className="size-4 text-primary" />
                                    )}
                                    {scanMode === "tracking_number"
                                       ? "Escanear Código de Barras o QR"
                                       : "Agregar por ID de Orden"}
                                 </label>
                                 <span className="text-xs text-muted-foreground animate-pulse">
                                    Listo para {scanMode === "tracking_number" ? "escanear" : "ingresar"}...
                                 </span>
                              </div>
                              <div className="flex gap-2">
                                 <Input
                                    ref={inputRef}
                                    value={currentInput}
                                    onChange={(e) => setCurrentInput(e.target.value)}
                                    placeholder={
                                       scanMode === "tracking_number"
                                          ? "Escanear o escribir tracking number..."
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
                                    {isAdding ? <Spinner className="h-4 w-4" /> : "Agregar"}
                                 </Button>
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
                                    <p className="font-bold text-lg">{lastScanStatus.value}</p>
                                    {lastScanStatus.description && (
                                       <p className="text-xs text-muted-foreground">{lastScanStatus.description}</p>
                                    )}
                                    <p className="text-sm opacity-90">
                                       {lastScanStatus.status === "matched" &&
                                          (lastScanStatus.count
                                             ? `${lastScanStatus.count} paquete(s) agregado(s) al contenedor`
                                             : "Agregado correctamente al contenedor")}
                                       {lastScanStatus.status === "surplus" &&
                                          (lastScanStatus.errorMessage || "Error: No encontrado")}
                                       {lastScanStatus.status === "duplicate" &&
                                          (lastScanStatus.errorMessage || "Advertencia: Ya está en el contenedor")}
                                    </p>
                                 </div>
                              </div>
                           )}
                        </CardContent>
                     </Card>

                     <ParcelsInContainer
                        containerId={containerIdNumber}
                        containerName={container?.container_name}
                        canModify={canLoadParcels}
                     />
                  </div>

                  {/* Right Column: Parcels Ready for Container */}
                  <ParcelsReadyForContainer />
               </div>
            )}
         </main>
      </div>
   );
};
