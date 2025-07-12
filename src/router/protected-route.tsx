// src/components/PrivateRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "@/stores/app-store";

const ProtectedRoute = () => {
	const { session } = useAppStore();

	// Redirect to login if not authenticated
	if (!session?.user) {
		return <Navigate to="/login" replace />;
	}

	// Render protected content if authenticated
	return <Outlet />;
};

export default ProtectedRoute;
