import { AppRouter } from "./router/app-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
export default function App() {
	return (
		
			<QueryClientProvider client={queryClient}>
				<AppRouter />
			</QueryClientProvider>
		
	);
}
