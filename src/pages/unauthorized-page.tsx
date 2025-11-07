import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const UnauthorizedPage = (): ReactElement => {
   return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
         <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Acceso denegado</p>
            <h1 className="text-3xl font-bold">No tienes permisos para ver esta página</h1>
            <p className="text-muted-foreground">
               Tu rol actual no incluye acceso a este módulo. Si crees que es un error, contacta a un administrador.
            </p>
         </div>
         <Button asChild>
            <Link to="/">Volver al inicio</Link>
         </Button>
      </div>
   );
};
