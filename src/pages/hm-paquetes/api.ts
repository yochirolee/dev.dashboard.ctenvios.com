import axios from "axios";
import type { ManifestResponse, ManifestHistoryResponse } from "./types";

/**
 * API específica para el módulo de tracking HM Paquetes
 */
export const hmPaquetesApi = {
   getByAgency: async (agencyName: string): Promise<ManifestResponse> => {
      const encodedAgency = encodeURIComponent(agencyName);
      const response = await axios.get(`http://72.60.114.241/api/manifiestos_por/agencia/${encodedAgency}/`);
      return response.data;
   },
   getHistory: async (manifestCode: string): Promise<ManifestHistoryResponse> => {
      const encodedCode = encodeURIComponent(manifestCode);
      const response = await axios.get(`http://72.60.114.241/api/historial/manifiesto/${encodedCode}`);
      return response.data;
   },
};

