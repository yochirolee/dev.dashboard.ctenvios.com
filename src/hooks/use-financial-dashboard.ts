import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import type { FinancialDashboard } from "@/data/types";

export const useFinancialDashboard = () => {
   return useQuery<FinancialDashboard>({
      queryKey: ["financial-dashboard"],
      queryFn: () => api.financialReports.getDashboard(),
      refetchOnWindowFocus: true,
      refetchOnMount: true,
   });
};
