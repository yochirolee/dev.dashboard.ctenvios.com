import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes
         retry: (failureCount, error: any) => {
            // No reintentar errores 4xx y 5xx (errores del servidor/cliente)
            if (error?.response?.status >= 400) {
               return false;
            }
            // Reintentar máximo 2 veces para errores de red
            return failureCount < 2;
         },
         refetchOnWindowFocus: true,
         refetchOnMount: true,
      },
   },
});
