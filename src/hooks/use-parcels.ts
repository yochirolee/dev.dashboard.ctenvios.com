import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import type { ParcelStatus } from "@/data/types";

/** Same pattern as useOrders.search: positional args (searchQuery, page, limit, status?, searchIn?). */
export const useParcels = {
   search: (
      searchQuery: string,
      page: number,
      limit: number,
      status?: ParcelStatus,
      searchIn?: "description" | "customer" | "receiver" | "order_id" | "hbl",
   ) => {
      return useQuery({
         queryKey: ["parcels", "search", searchQuery, page, limit, status, searchIn],
         queryFn: () => api.parcels.search(searchQuery, page, limit, status, searchIn),
         staleTime: 1000 * 60 * 5,
      });
   },
};
