import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import type { DailyClosing } from "@/data/types";

export interface DailyClosingFilters {
   date?: string;
   user_id?: string;
   agency_id?: number;
}

export const useDailyClosing = (filters?: DailyClosingFilters) => {
   return useQuery<DailyClosing>({
      queryKey: ["financial-reports", "daily-closing", filters],
      queryFn: () => api.financialReports.getDailyClosing(filters),
      refetchOnWindowFocus: true,
      refetchOnMount: true,
   });
};
