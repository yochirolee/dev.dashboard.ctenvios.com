// src/components/PrivateRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { CogIcon } from "lucide-react";

const ProtectedRoute = () => {
	const { data: session, isPending, error } = authClient.useSession();

	console.log(session);

	// Show loading spinner while checking authentication
	if (isPending) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<CogIcon className="h-6 w-6 animate-spin mr-2" />
				<p>Loading...</p>
			</div>
		);
	}

	// Handle authentication errors
	if (error) {
		console.error("Authentication error:", error);
		return <Navigate to="/login" replace />;
	}

	// Redirect to login if not authenticated
	if (!session?.user) {
		return <Navigate to="/login" replace />;
	}

	// Render protected content if authenticated
	return <Outlet />;
};

export default ProtectedRoute;
