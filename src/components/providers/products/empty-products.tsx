import { BoxIcon } from "lucide-react";
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "../../ui/empty";
export const EmptyProducts = () => {
   return (
      <Empty>
         <EmptyHeader>
            <EmptyMedia variant="icon">
               <BoxIcon />
            </EmptyMedia>
            <EmptyTitle>No hay productos</EmptyTitle>
            <EmptyDescription>Agrega un producto para el servicio</EmptyDescription>
         </EmptyHeader>
      </Empty>
   );
};
