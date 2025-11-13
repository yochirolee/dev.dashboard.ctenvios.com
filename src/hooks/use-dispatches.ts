import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export const useDispatches = {
   get: () => {
      return useQuery({
         queryKey: ["dispatches"],
         queryFn: () => api.dispatch.get(0, 25),
      });
   },
};
