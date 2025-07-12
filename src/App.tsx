import { AppRouter } from "./router/app-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { useAppStore } from "./stores/app-store";
import { authClient } from "./lib/auth-client";
import { useEffect } from "react";
import { AlertCircleIcon, CogIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function App() {
	const { data: session, isPending, error } = authClient.useSession();
	const { setSession, clearSession } = useAppStore();
	const navigate = useNavigate();
	console.log(session, "session on app");
	useEffect(() => {
		if (session?.user) {
			setSession(session); // Guardamos en Zustand
		}
		if (error) {
			clearSession(); // Eliminamos de Zustand
			navigate("/login");
		}
	}, [session, error]);

	if (isPending) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<CogIcon className="h-6 w-6 animate-spin mr-2" />
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<AlertCircleIcon className="h-6 w-6 mr-2" />
				<p>Error: {error.message}</p>
			</div>
		);
	}

	return (
		<QueryClientProvider client={queryClient}>
			<AppRouter />
		</QueryClientProvider>
	);
}
