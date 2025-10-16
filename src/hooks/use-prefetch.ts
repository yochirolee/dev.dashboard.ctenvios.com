import { queryClient } from "@/lib/query-client";
import api from "@/api/api";

export const usePrefetch = {
   customsRates: async (page: number, limit: number) => {
      return await queryClient.prefetchQuery({
         queryKey: ["customs-rates", page, limit],
         queryFn: () => api.customs.get(page, limit),
         staleTime: 1000 * 60 * 5,
      });
   },
};
