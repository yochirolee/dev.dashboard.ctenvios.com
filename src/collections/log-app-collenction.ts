import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import api from "@/api/api";
import { queryClient } from "@/lib/query-client";

export const logAppCollection = createCollection(
   queryCollectionOptions({
      queryClient,
      queryKey: ["log-app"],
      queryFn: async () => {
          const response = await api.logs.getAppLogs(1, 1000);
          console.log("response", response);
         // response is already response.data, which has { rows: [...], total: number }
         // Collections expect an array, so return the rows
         return response.rows;
      },
      getKey: (item: { id: number }) => item.id,
      // Remove onUpdate if you don't need it, or fix it based on your actual update API
      // onUpdate: async ({ transaction }) => {
      //    // Implement proper update logic if needed
      // },
   })
);