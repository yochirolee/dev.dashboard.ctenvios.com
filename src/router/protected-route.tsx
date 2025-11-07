// src/components/PrivateRoute.tsx
import type { ReactElement } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "@/stores/app-store";

interface ProtectedRouteProps {
   allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps): ReactElement => {
   const { session, user } = useAppStore();

   if (!session) {
      return <Navigate to="/login" replace />;
   }

   if (allowedRoles?.length) {
      const userRole = user?.role;
      const isAllowed = userRole ? allowedRoles.includes(userRole) : false;

      if (!isAllowed) {
         return <Navigate to="/unauthorized" replace />;
      }
   }

   return <Outlet />;
};

export default ProtectedRoute;
