import { useRef } from "react";
import { useAgencies } from "@/hooks/use-agencies";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Trash2 } from "lucide-react";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgencyLogoUploadProps {
   agencyId: number;
   agencyName: string;
   currentLogo?: string | null;
}

export const AgencyLogoUpload = ({ agencyId, agencyName, currentLogo }: AgencyLogoUploadProps): React.ReactElement => {
   const fileInputRef = useRef<HTMLInputElement>(null);

   const { mutate: uploadLogo, isPending: isUploading } = useAgencies.uploadLogo(agencyId, {
      onSuccess: () => {
         toast.success("Logo actualizado correctamente");
      },
      onError: () => {
         toast.error("Error al subir el logo");
      },
   });

   const { mutate: deleteLogo, isPending: isDeleting } = useAgencies.deleteLogo(agencyId, {
      onSuccess: () => {
         toast.success("Logo eliminado correctamente");
      },
      onError: () => {
         toast.error("Error al eliminar el logo");
      },
   });

   const isPending = isUploading || isDeleting;

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (file) {
         // Validate file type
         if (!file.type.startsWith("image/")) {
            toast.error("Por favor selecciona una imagen válida");
            return;
         }
         // Validate file size (max 5MB)
         if (file.size > 5 * 1024 * 1024) {
            toast.error("La imagen no puede superar los 5MB");
            return;
         }
         uploadLogo(file);
      }
      // Reset input
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
   };

   const handleUploadClick = (): void => {
      fileInputRef.current?.click();
   };

   const handleDeleteClick = (): void => {
      deleteLogo();
   };

   const initials = agencyName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

   return (
      <div className="relative group">
         <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

         <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={isPending}>
               <button className="relative cursor-pointer focus:outline-none" type="button">
                  <Avatar className="w-20 h-20 border-2 border-border">
                     <AvatarImage src={currentLogo || undefined} alt={agencyName} className="object-cover" />
                     <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     {isPending ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                     ) : (
                        <Camera className="w-6 h-6 text-white" />
                     )}
                  </div>
               </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
               <DropdownMenuItem onClick={handleUploadClick}>
                  <Camera className="w-4 h-4 mr-2" />
                  {currentLogo ? "Cambiar logo" : "Subir logo"}
               </DropdownMenuItem>
               {currentLogo && (
                  <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive">
                     <Trash2 className="w-4 h-4 mr-2" />
                     Eliminar logo
                  </DropdownMenuItem>
               )}
            </DropdownMenuContent>
         </DropdownMenu>
      </div>
   );
};
