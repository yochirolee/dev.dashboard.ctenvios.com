import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ProductCardActions = () => {
   return (
      <ButtonGroup>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon" aria-label="More Options">
                  <EllipsisVerticalIcon />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem>
                  <PencilIcon />
                  Editar
               </DropdownMenuItem>
               <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  Eliminar
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </ButtonGroup>
   );
};
