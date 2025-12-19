import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import api from "@/api/api";
import { queryClient } from "@/lib/query-client";

export const issuesCollection = createCollection(
   queryCollectionOptions({
      queryKey: ["issues"],
      queryFn: async () => {
         const response = await api.issues.getAll();
         return response.data;
      },
      queryClient,
      getKey: (item: { id: number }) => item.id,
   })
);
