import { useRef } from "react";
import { Barcode, CheckCircle2, AlertTriangle, RefreshCw, PackagePlus, Scan, Package, FileText, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "../ui/input-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export type ScanStatus = "matched" | "surplus" | "duplicate" | "verified" | "not_found" | "invalid" | "error";
export type ScanMode = "tracking_number" | "order_id";

export interface ScanFeedback {
   tracking_number: string;
   status: ScanStatus;
   description?: string;
   errorMessage?: string;
   count?: number;
}

interface ScannerCardProps {
   value: string;
   onChange: (value: string) => void;
   onScan: (e?: React.FormEvent) => void;
   lastScanStatus: ScanFeedback | null;
   buttonLabel?: string;
   placeholder?: string;
   isLoading?: boolean;
   scanMode?: ScanMode;
   onScanModeChange?: (mode: ScanMode) => void;
   showScanMode?: boolean;
}

export const ScannerCard = ({
   value,
   onChange,
   onScan,
   lastScanStatus,
   placeholder,
   isLoading = false,
   scanMode = "tracking_number",
   onScanModeChange,
   showScanMode = false,
}: ScannerCardProps): React.ReactElement => {
   const inputRef = useRef<HTMLInputElement>(null);

   const handleSubmit = (e?: React.FormEvent): void => {
      e?.preventDefault();
      onScan(e);
      inputRef.current?.focus();
   };

   const getPlaceholder = (): string => {
      if (placeholder) return placeholder;
      return scanMode === "tracking_number" 
         ? "Escanear o escribir tracking..." 
         : "Ingresar ID de orden...";
   };

   const getTitle = (): string => {
      return scanMode === "tracking_number" 
         ? "Escanear código" 
         : "Agregar por Orden";
   };

   return (
      <Card className="rounded-xl gap-2 border border-border/60 bg-card/60">
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               {scanMode === "tracking_number" ? (
                  <Barcode className="size-4 text-primary" />
               ) : (
                  <FileText className="size-4 text-primary" />
               )}
               {getTitle()}
            </CardTitle>
         </CardHeader>
         <CardContent>
            <form onSubmit={handleSubmit}>
               <InputGroup className="w-full">
                  <InputGroupInput
                     ref={inputRef}
                     value={value}
                     onChange={(e) => onChange(e.target.value)}
                     placeholder={getPlaceholder()}
                     type={scanMode === "order_id" ? "number" : "text"}
                     autoFocus
                  />
                  {showScanMode && onScanModeChange && (
                     <InputGroupAddon align="inline-end">
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                              <InputGroupButton variant="ghost" className="!pr-1.5 text-xs gap-1">
                                 {scanMode === "tracking_number" ? (
                                    <>
                                       <Package className="size-3.5" />
                                       Tracking
                                    </>
                                 ) : (
                                    <>
                                       <FileText className="size-3.5" />
                                       Orden
                                    </>
                                 )}
                                 <ChevronDown className="size-3" />
                              </InputGroupButton>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                 <DropdownMenuItem onClick={() => onScanModeChange("tracking_number")}>
                                    <Package className="size-4 mr-2" />
                                    Tracking #
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => onScanModeChange("order_id")}>
                                    <FileText className="size-4 mr-2" />
                                    Orden ID
                                 </DropdownMenuItem>
                              </DropdownMenuGroup>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </InputGroupAddon>
                  )}
                  <InputGroupAddon>
                     {isLoading ? <Spinner /> : <Scan />}
                  </InputGroupAddon>
               </InputGroup>
            </form>
            {lastScanStatus && <ScanFeedbackDisplay feedback={lastScanStatus} />}
         </CardContent>
      </Card>
   );
}; 

interface ScanFeedbackDisplayProps {
   feedback: ScanFeedback;
}

export const ScanFeedbackDisplay = ({ feedback }: ScanFeedbackDisplayProps): React.ReactElement => {
   const getStatusStyles = (): string => {
      switch (feedback.status) {
         case "matched":
         case "verified":
            return "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
         case "surplus":
            return "bg-orange-500/10 border-orange-500/30 text-orange-500";
         case "duplicate":
            return "bg-yellow-500/10 border-yellow-500/30 text-yellow-500";
         default:
            return "bg-red-500/10 border-red-500/30 text-red-500";
      }
   };

   const getIcon = (): React.ReactElement => {
      switch (feedback.status) {
         case "matched":
         case "verified":
            return <CheckCircle2 className="h-6 w-6" />;
         case "surplus":
            return <PackagePlus className="h-6 w-6" />;
         case "duplicate":
            return <RefreshCw className="h-6 w-6" />;
         default:
            return <AlertTriangle className="h-6 w-6" />;
      }
   };

   const getMessage = (): string => {
      if (feedback.errorMessage) return feedback.errorMessage;
      if (feedback.description) return feedback.description;
      
      switch (feedback.status) {
         case "matched":
            return feedback.count !== undefined 
               ? `${feedback.count} paquete(s) agregado(s)` 
               : "Agregado correctamente";
         case "verified":
            return "Verificado correctamente";
         case "surplus":
            return "No está en ningún manifiesto";
         case "duplicate":
            return "Ya fue escaneado";
         case "not_found":
            return "Paquete no encontrado";
         default:
            return "Error al procesar";
      }
   };

   return (
      <div
         className={`p-4 mt-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${getStatusStyles()}`}
      >
         {getIcon()}
         <div className="flex-1">
            <p className="font-bold text-lg">{feedback.tracking_number}</p>
            <p className="text-sm opacity-90">{getMessage()}</p>
         </div>
      </div>
   );
};
