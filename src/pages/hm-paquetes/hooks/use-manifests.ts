import { useQuery } from "@tanstack/react-query";
import { hmPaquetesApi } from "../api";
import type { ManifestResponse, ManifestHistoryResponse } from "../types";

export const useManifests = {
   getByAgency: (agencyName: string) => {
      return useQuery<ManifestResponse>({
         queryKey: ["hm-paquetes", "manifests", "by-agency", agencyName],
         queryFn: () => hmPaquetesApi.getByAgency(agencyName),
         enabled: !!agencyName,
         staleTime: 1000 * 60 * 5,
      });
   },
   getHistory: (manifestCode: string) => {
      return useQuery<ManifestHistoryResponse>({
         queryKey: ["hm-paquetes", "manifests", "history", manifestCode],
         queryFn: () => hmPaquetesApi.getHistory(manifestCode),
         enabled: !!manifestCode,
         staleTime: 1000 * 60 * 2,
      });
   },
};

