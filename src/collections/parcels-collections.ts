import { createCollection, eq, and, or, ilike } from "@tanstack/react-db";
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
         log: "changes_only",
         params: {
            table: `"Parcel"`,
         } as any,
         headers: {
            authorization: () => `Bearer ${useAppStore.getState().session?.token ?? ""}`,
         },
      },
   }) as unknown as Parameters<typeof createCollection>[0],
);

export const useParcelsInContainer = (containerId: number) => {
   const { data: parcels } = useLiveQuery((q) =>
      q
         .from({ parcel: parcelsCollection })
         .where(({ parcel }) => eq((parcel as { container_id: number }).container_id, containerId)),
   );
   return parcels;
};

export const useParcelsInPallet = (palletId: number) => {
   const { data: parcels } = useLiveQuery((q) =>
      q
         .from({ parcel: parcelsCollection })
         .where(({ parcel }) => eq((parcel as { pallet_id: number }).pallet_id, palletId)),
   );
   return parcels;
};

export interface ParcelFilters {
   status?: string;
   search?: string;
   limit?: number;
   offset?: number;
}

export const useLiveParcels = (filters?: ParcelFilters) => {
   const status = filters?.status;
   const search = filters?.search?.toLowerCase().trim() || "";

   const {
      data: parcels,
      isLoading,
      isError,
   } = useLiveQuery(
      (q) => {
         let query = q.from({ parcel: parcelsCollection });

         if (status || search) {
            const searchPattern = `%${search}%`;
            const orderIdNum = parseInt(search, 10);
            const searchIsOrderId = search && String(orderIdNum) === search;

            query = query.where(({ parcel }) => {
               const p = parcel as {
                  status: string;
                  tracking_number: string;
                  description: string;
                  order_id: number;
                  limit: number;
                  offset: number;
                  total: number;
               };
               const statusCond = status ? eq(p.status, status) : null;
               const searchCond = search
                  ? searchIsOrderId
                     ? or(
                          ilike(p.tracking_number, searchPattern),
                          ilike(p.description, searchPattern),
                          eq(p.order_id, orderIdNum),
                       )
                     : or(ilike(p.tracking_number, searchPattern), ilike(p.description, searchPattern))
                  : null;
               if (statusCond && searchCond) return and(statusCond, searchCond);
               return (statusCond ?? searchCond)!;
            });
         }

         return query.orderBy(({ parcel }) => (parcel as { updated_at: string }).updated_at, "desc");
      },
      [status, search],
   );
   console.log(parcels, "parcels");
   return { parcels, isLoading, isError };
};
