import { useShape } from "@electric-sql/react";
import { DataTable } from "@/components/ui/data-table";
import { partnersLogColumns } from "@/pages/app-logs/components/partners-log-columns";
import usePagination from "@/hooks/use-pagination";
import type { PartnerLog } from "@/pages/app-logs/components/partners-log-columns";
import { useAppStore } from "@/stores/app-store";

export function PartnersLogsPage() {
   const { pagination, setPagination } = usePagination();
   const { data, isLoading } = useShape({
      url: `http://localhost:3000/api/v1/electric/shape`,
      params: {
         table: `"PartnerLog"`,
         orderBy: `"id"`,
         orderDirection: `"desc"`,
      },
      headers: {
         authorization: `Bearer ${useAppStore.getState().session?.token}`,
      },
   });

   const allRows = (data as unknown as PartnerLog[]) ?? [];
   const sortedRows = [...allRows].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order (newest first)
   });
   const rows = sortedRows.slice(0, 20);
   const total = rows.length;

   return (
      <div className="flex flex-col gap-4">
         <div className="flex flex-col">
            <h3 className="font-bold">Partners Logs</h3>
            <p className="text-sm text-gray-500">Listado de logs de partners</p>
         </div>
         <DataTable
            columns={partnersLogColumns}
            data={{ rows, total }}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
         />
      </div>
   );
}
