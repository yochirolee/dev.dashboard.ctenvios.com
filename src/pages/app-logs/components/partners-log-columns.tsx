import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";

export interface PartnerLog {
   api_key_id: string;
   created_at: string;
   endpoint: string;
   id: number;
   ip_address: string;
   method: string;
   partner_id: number;
   request_body: Record<string, unknown>;
   response_body: Record<string, unknown>;
   status_code: number;
   user_agent: string | null;
}

const getStatusBadgeVariant = (statusCode: number): "default" | "secondary" | "destructive" | "outline" => {
   if (statusCode >= 200 && statusCode < 300) {
      return "default";
   }
   if (statusCode >= 300 && statusCode < 400) {
      return "secondary";
   }
   return "destructive";
};

const getMethodBadgeVariant = (method: string): "default" | "secondary" | "destructive" | "outline" => {
   switch (method.toUpperCase()) {
      case "GET":
         return "default";
      case "POST":
         return "secondary";
      case "PUT":
      case "PATCH":
         return "outline";
      case "DELETE":
         return "destructive";
      default:
         return "secondary";
   }
};

export const partnersLogColumns: ColumnDef<PartnerLog>[] = [
   {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
         return <div className="font-medium">{row.original?.id}</div>;
      },
      size: 80,
   },
   {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => {
         return (
            <div className="font-mono text-xs text-muted-foreground">
               {format(new Date(row.original?.created_at), "dd/MM/yyyy HH:mm:ss")}
            </div>
         );
      },
      size: 150,
   },
   {
      accessorKey: "method",
      header: "Método",
      cell: ({ row }) => {
         return (
            <Badge variant={getMethodBadgeVariant(row.original?.method)} className="whitespace-nowrap">
               {row.original?.method}
            </Badge>
         );
      },
      size: 100,
   },
   {
      accessorKey: "endpoint",
      header: "Endpoint",
      cell: ({ row }) => {
         return (
            <div className="max-w-[200px] truncate" title={row.original?.endpoint}>
               {row.original?.endpoint}
            </div>
         );
      },
      size: 150,
   },
   {
      accessorKey: "ip_address",
      header: "IP Address",
      cell: ({ row }) => {
         return <div className="font-mono text-xs text-muted-foreground">{row.original?.ip_address}</div>;
      },
      size: 130,
   },
   {
      accessorKey: "status_code",
      header: "Status",
      cell: ({ row }) => {
         const statusCode = row.original?.status_code;
         const isSuccess = statusCode === 200;
         return (
            <Badge
               variant={getStatusBadgeVariant(statusCode)}
               className={`whitespace-nowrap ${
                  isSuccess ? "bg-green-500/80 text-white border-transparent hover:bg-green-500/90" : ""
               }`}
            >
               {statusCode}
            </Badge>
         );
      },
      size: 100,
   },
   {
      accessorKey: "partner_id",
      header: "Partner ID",
      cell: ({ row }) => {
         return <div>{row.original?.partner_id}</div>;
      },
      size: 100,
   },
   {
      accessorKey: "user_agent",
      header: "User Agent",
      cell: ({ row }) => {
         const userAgent = row.original?.user_agent;
         return (
            <div className="max-w-[200px] truncate text-xs text-muted-foreground" title={userAgent || ""}>
               {userAgent || "N/A"}
            </div>
         );
      },
      size: 200,
   },
   {
      id: "details",
      header: "",
      cell: ({ row }) => {
         return (
            <Dialog>
               <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                     <EyeIcon className="w-4 h-4" />
                  </Button>
               </DialogTrigger>
               <DialogContent className="max-w-4xl lg:max-w-6xl max-h-[80vh] ">
                  <DialogHeader>
                     <DialogTitle>Request Details</DialogTitle>
                     <DialogDescription>View request and response details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 overflow-y-auto max-h-[60vh] ">
                     <div>
                        <h3 className="font-semibold mb-2">Request Body</h3>
                        <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                           {JSON.stringify(row.original?.request_body, null, 2)}
                        </pre>
                     </div>
                     <div>
                        <h3 className="font-semibold mb-2">Response Body</h3>
                        <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                           {JSON.stringify(row.original?.response_body, null, 2)}
                        </pre>
                     </div>
                  </div>
               </DialogContent>
            </Dialog>
         );
      },
      size: 60,
      enableSorting: false,
   },
];
