import { AppRouter } from "./router/app-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-provider";

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>
				<BrowserRouter>
					<AppRouter />
				</BrowserRouter>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
