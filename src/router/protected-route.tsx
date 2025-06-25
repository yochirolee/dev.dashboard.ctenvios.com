// src/components/PrivateRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
const ProtectedRoute = () => {
	return <Outlet />;
};

export default ProtectedRoute;
