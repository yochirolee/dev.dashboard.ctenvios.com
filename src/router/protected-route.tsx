// src/components/PrivateRoute.tsx
import type { ReactElement } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "@/stores/app-store";
import { hasRole, type Role } from "@/lib/rbac";

interface ProtectedRouteProps {
   allowedRoles?: readonly Role[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps): ReactElement => {
   const { session, user } = useAppStore();

   if (!session) {
      return <Navigate to="/login" replace />;
   }

   if (allowedRoles?.length) {
      const userRole = user?.role as Role | undefined;
      const isAllowed = hasRole(userRole, allowedRoles);

      if (!isAllowed) {
         return <Navigate to="/unauthorized" replace />;
      }
   }

   return <Outlet />;
};

export default ProtectedRoute;
