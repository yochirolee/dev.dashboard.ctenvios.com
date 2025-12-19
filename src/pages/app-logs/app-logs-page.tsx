import { DataTable } from "@/components/ui/data-table";
import { appLogsColumns } from "./components/app-logs-columns";
import usePagination from "@/hooks/use-pagination";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import type { AppLogsFilters } from "./components/app-logs-filters";
import { AppLogsFiltersComponent } from "./components/app-logs-filters";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

export const useAppLogs = (page: number, limit: number, filters?: AppLogsFilters) => {
   return useQuery({
      queryKey: ["app-logs", page, limit, filters],
      queryFn: () => api.logs.getAppLogs(page, limit, filters),
      staleTime: 1000 * 60 * 5,
   });
};

export const useLogStatus = () => {
   return useQuery({
      queryKey: ["log-status"],
      queryFn: () => api.logs.logStatus(),
      refetchOnWindowFocus: true,
   });
};

export const useToggleAppLogs = () => {
   return useMutation({
      mutationFn: (currentStatus: boolean) => api.logs.toggleAppLogs(currentStatus),
      onSuccess: (data) => {
         toast.success(data.message);
         queryClient.invalidateQueries({ queryKey: ["log-status"] });
      },
      onError: (error) => {
         toast.error(error.message);
      },
   });
};

export const useDeleteAllLogs = () => {
   return useMutation({
      mutationFn: () => api.logs.deleteAllLogs(),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["app-logs"] });
      },
   });
};

export function AppLogsPage() {
   const { pagination, setPagination } = usePagination();
   const [filters, setFilters] = useState<AppLogsFilters>({});

   const { data, isLoading, error } = useAppLogs(pagination.pageIndex, pagination.pageSize, filters);

   if (error) {
      return <div>Error: {error.message}</div>;
   }

   const { data: logStatus, isLoading: isLoadingLogStatus } = useLogStatus();

   const logsEnabled = logStatus?.status;
   const { mutate: toggleAppLogs } = useToggleAppLogs();

   const handleClearFilters = () => {
      setFilters({});
      setPagination({ ...pagination, pageIndex: 0 });
   };

   return (
      <div className="flex flex-col gap-4 p-2 md:p-4">
         <div className="flex flex-col">
            <h3 className="font-bold">App Logs</h3>
            <p className="text-sm text-gray-500">Listado de logs de la aplicación</p>
         </div>
         <div className="flex flex-row justify-between gap-4 items-start">
            <div className="flex flex-col gap-2 flex-1">
               <AppLogsFiltersComponent
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={handleClearFilters}
               />
            </div>
            <div className="inline-flex flex-row gap-2 items-center">
               <div className="flex flex-row gap-2 items-center">
                  <Switch
                     checked={logsEnabled}
                     onCheckedChange={() => {
                        toggleAppLogs(logsEnabled);
                     }}
                     disabled={isLoading || isLoadingLogStatus}
                  />
                  <Label>Activar Logs</Label>
               </div>
               <ConfirmDeleteAllLogsModal />
            </div>
         </div>
         <DataTable
            columns={appLogsColumns}
            data={{ rows: data?.rows || [], total: data?.total || 0 }}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={isLoading}
         />
      </div>
   );
}

const ConfirmDeleteAllLogsModal = () => {
   const [open, setOpen] = useState(false);
   const { mutate: deleteAllLogs, isPending: isDeletingLogs } = useDeleteAllLogs();

   const handleDelete = () => {
      deleteAllLogs(undefined, {
         onSuccess: () => {
            toast.success("Logs deleted successfully");
            setOpen(false);
         },
         onError: (error) => {
            toast.error(error.message);
         },
      });
      setOpen(false);
   };

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
               <Trash className="w-4 h-4" />
               Delete all logs
            </Button>
         </DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Delete all logs</DialogTitle>
               <DialogDescription>Are you sure you want to delete all logs?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
               <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
               </Button>
               <Button variant="destructive" onClick={handleDelete}>
                  {isDeletingLogs ? (
                     <>
                        <Spinner /> Deleting...{" "}
                     </>
                  ) : (
                     "Delete"
                  )}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};
