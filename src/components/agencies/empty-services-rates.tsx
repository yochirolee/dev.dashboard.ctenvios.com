import { TriangleAlert } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { Card } from "../ui/card";

export const EmptyServicesRates = () => {
   return (
      <Card>
         <Empty>
            <EmptyHeader>
               <EmptyMedia variant="icon">
                  <TriangleAlert />
               </EmptyMedia>
               <EmptyTitle>No hay servicios o tarifas activas</EmptyTitle>
               <EmptyDescription>
                  Por favor, contacta a tu administrador para agregar servicios o tarifas.
               </EmptyDescription>
            </EmptyHeader>
         </Empty>
      </Card>
   );
};
