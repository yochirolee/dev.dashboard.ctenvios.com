import { CheckCircle2, Circle, PackagePlus, Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import QRCode from "react-qr-code";
import { Item, ItemContent, ItemDescription, ItemActions, ItemMedia, ItemTitle } from "@/components/ui/item";

export interface ParcelData {
   id?: number;
   tracking_number: string;
   order_id?: number;
   description?: string;
   weight?: number;
   status?: string;
   updated_at?: string;
   dispatch_id?: number;
}

interface ParcelItemProps {
   pkg: ParcelData;
   variant?: "added" | "pending" | "matched" | "surplus";
   statusLabel?: string;
   onRemove?: () => void;
   isRemoving?: boolean;
   showQR?: boolean;
   showWeight?: boolean;
   showScanDate?: boolean;
}

export const ParcelItem = ({
   pkg,
   variant = "pending",
   statusLabel,
   onRemove,
   isRemoving = false,
   showQR = true,
   showWeight = true,
   showScanDate = true,
}: ParcelItemProps): React.ReactElement => {
   const isPositive = variant === "added" || variant === "matched";
   const isSurplus = variant === "surplus";
   
   const getVariantStyles = (): { border: string; bg: string; iconBg: string } => {
      switch (variant) {
         case "added":
         case "matched":
            return {
               border: "border-emerald-500/40",
               bg: "bg-emerald-500/10",
               iconBg: "border-emerald-500/40 bg-emerald-500/10",
            };
         case "surplus":
            return {
               border: "border-orange-500/40",
               bg: "bg-orange-500/10",
               iconBg: "border-orange-500/40 bg-orange-500/10",
            };
         default:
            return {
               border: "",
               bg: "",
               iconBg: "",
            };
      }
   };

   const styles = getVariantStyles();
   const label = statusLabel ?? (isPositive ? "AGREGADO" : isSurplus ? "SURPLUS" : "PENDIENTE");

   return (
      <Item
         variant={isPositive || isSurplus ? "outline" : "muted"}
         className={cn("mx-4 my-2", styles.border, styles.bg)}
      >
         <ItemMedia variant="icon" className={styles.iconBg}>
            {isPositive ? (
               <CheckCircle2 className="size-4 text-emerald-500" />
            ) : isSurplus ? (
               <PackagePlus className="size-4 text-orange-500" />
            ) : (
               <Circle className="size-4" />
            )}
         </ItemMedia>
         {showQR && (
            <QRCode
               value={pkg.tracking_number}
               size={48}
               className="rounded border border-border/40 p-1 bg-white shrink-0"
            />
         )}
         <ItemContent>
            <ItemTitle>
               {pkg.tracking_number}
               {pkg.order_id && <Badge variant="outline">Orden: {pkg.order_id}</Badge>}
               {pkg.dispatch_id && variant === "matched" && (
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">
                     Despacho #{pkg.dispatch_id}
                  </Badge>
               )}
               {isSurplus && (
                  <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                     Surplus
                  </Badge>
               )}
            </ItemTitle>
            {pkg.description && <ItemDescription>{pkg.description}</ItemDescription>}
            {showScanDate && isPositive && pkg.updated_at && (
               <span className="text-xs">
                  Escaneado: {format(new Date(pkg.updated_at), "dd/MM/yyyy HH:mm")}
               </span>
            )}
         </ItemContent>
         <ItemActions>
            {showWeight && pkg.weight != null && (
               <span className="text-xs text-muted-foreground">{pkg.weight} lbs</span>
            )}
            <Badge variant="outline">{label}</Badge>
            {onRemove && (
               <Button variant="ghost" size="sm" onClick={onRemove} disabled={isRemoving}>
                  {isRemoving ? <Spinner /> : variant === "matched" || variant === "surplus" ? <X className="h-4 w-4" /> : <Trash className="h-4 w-4" />}
               </Button>
            )}
         </ItemActions>
      </Item>
   );
};
