import { LockIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Empty, EmptyTitle, EmptyHeader, EmptyMedia, EmptyDescription, EmptyContent } from "../ui/empty";
import { containerStatus } from "@/data/types";
import { useNavigate } from "react-router-dom";

export const LockContainerState = () => {
   const navigate = useNavigate();
   return (
      <div className="flex items-center justify-center h-full">
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <LockIcon className="size-10" />
               </EmptyMedia>
               <EmptyTitle>No se pueden agregar paquetes al contenedor en este estado</EmptyTitle>
               <EmptyDescription>
                  El contenedor debe estar en estado <Badge variant="outline">{containerStatus.PENDING}</Badge> o{" "}
                  <Badge variant="outline">{containerStatus.LOADING}</Badge> para agregar paquetes.
               </EmptyDescription>
               <EmptyContent>
                  <Button onClick={() => navigate("/logistics/containers")} variant="outline">
                     Ver Contenedor
                  </Button>
               </EmptyContent>
            </EmptyHeader>
         </Empty>
      </div>
   );
};
