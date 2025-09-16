import { AppRouter } from "./router/app-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";



export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false} />
			<ThemeProvider>
				<BrowserRouter>
					<AppRouter />
				</BrowserRouter>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
