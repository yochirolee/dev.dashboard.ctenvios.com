import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { useLiveQuery } from "@tanstack/react-db";
import { useAppStore } from "@/stores/app-store";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Type assertion needed due to @tanstack/db vs @tanstack/react-db version mismatch
export const parcelsCollection = createCollection(
   electricCollectionOptions({
      id: "parcels",
      getKey: (item: { id: number }) => item.id,
      shapeOptions: {
         url: `${apiBaseUrl}/electric/shape`,
         params: {
            table: `"Parcel"`,
         },
         headers: {
            authorization: () => `Bearer ${useAppStore.getState().session?.token ?? ""}`,
         },
      },
   }) as unknown as Parameters<typeof createCollection>[0]
);

export const useParcels = () => {
   const { data: parcels } = useLiveQuery((q) => q.from({ parcel: parcelsCollection }));
   return parcels;
};
