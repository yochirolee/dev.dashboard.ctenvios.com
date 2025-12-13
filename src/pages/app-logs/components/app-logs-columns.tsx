import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface AppLog {
   id: number;
   level: string;
   message: string;
   source: string;
   code: string | null;
   status_code: number | null;
   path: string;
   method: string;
   user_email: string | null;
   created_at: string;
   user: {
      id: string;
      name: string;
      email: string;
   } | null;
}

const getLevelBadgeColor = (level: string): string => {
   switch (level) {
      case "HTTP":
         return "bg-blue-400/80 ring-blue-500/40";
      case "INFO":
         return "bg-green-400/80 ring-green-500/40";
      case "WARN":
         return "bg-yellow-400/80 ring-yellow-500/40";
      case "ERROR":
         return "bg-red-400/80 ring-red-500/40";
      default:
         return "bg-gray-400/80 ring-gray-500/40";
   }
};

const getStatusCodeColor = (statusCode: number | null): string => {
   if (!statusCode) return "bg-gray-400/80 ring-gray-500/40";
   if (statusCode >= 200 && statusCode < 300) return "bg-green-400/80 ring-green-500/40";
   if (statusCode >= 300 && statusCode < 400) return "bg-blue-400/80 ring-blue-500/40";
   if (statusCode >= 400 && statusCode < 500) return "bg-yellow-400/80 ring-yellow-500/40";
   if (statusCode >= 500) return "bg-red-400/80 ring-red-500/40";
   return "bg-gray-400/80 ring-gray-500/40";
};

const getMethodColor = (method: string): string => {
   switch (method.toUpperCase()) {
      case "GET":
         return "text-blue-600 dark:text-blue-400";
      case "POST":
         return "text-green-600 dark:text-green-400";
      case "PUT":
         return "text-yellow-600 dark:text-yellow-400";
      case "DELETE":
         return "text-red-600 dark:text-red-400";
      case "PATCH":
         return "text-purple-600 dark:text-purple-400";
      default:
         return "text-muted-foreground";
   }
};

export const appLogsColumns: ColumnDef<AppLog>[] = [
   {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
         return <span className="font-mono text-xs text-muted-foreground">{row.original?.id}</span>;
      },
      size: 80,
   },
   {
      accessorKey: "level",
      header: "Level",
      cell: ({ row }) => {
         const level = row.original?.level || "";
         const color = getLevelBadgeColor(level);
         return (
            <Badge className="w-fit" variant="secondary">
               <span
                  className={`rounded-full ${color} text-white text-xs h-1.5 ring-1 w-1.5 flex items-center justify-center`}
               />
               <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">{level}</span>
            </Badge>
         );
      },
      size: 100,
   },
   {
      accessorKey: "method",
      header: "Method & Path",
      cell: ({ row }) => {
         const method = row.original?.method || "";
         const path = row.original?.path || "";
         const methodColor = getMethodColor(method);
         return (
            <div className="flex items-center gap-2 min-w-0">
               <span className={`font-mono text-xs font-semibold shrink-0 ${methodColor}`}>{method}</span>
               <span className="font-mono text-xs text-muted-foreground truncate" title={path}>
                  {path}
               </span>
            </div>
         );
      },
      size: 300,
   },
   {
      accessorKey: "status_code",
      header: "Status",
      cell: ({ row }) => {
         const statusCode = row.original?.status_code;
         if (!statusCode) {
            return <span className="text-xs text-muted-foreground">-</span>;
         }
         const color = getStatusCodeColor(statusCode);
         return (
            <Badge className="w-fit" variant="secondary">
               <span
                  className={`rounded-full ${color} text-white text-xs h-1.5 ring-1 w-1.5 flex items-center justify-center`}
               />
               <span className="ml-1 text-nowrap font-extralight text-muted-foreground text-xs">{statusCode}</span>
            </Badge>
         );
      },
      size: 100,
   },
   {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => {
         const user = row.original?.user;
         if (!user) {
            return <span className="text-xs text-muted-foreground">-</span>;
         }
         return (
            <div className="flex items-center gap-2 min-w-0">
               <Avatar className="w-6 h-6 shrink-0">
                  <AvatarFallback className="text-xs">
                     {user?.name?.charAt(0) || user?.email?.charAt(0) || ""}
                  </AvatarFallback>
               </Avatar>
               <div className="min-w-0">
                  <div className="truncate text-xs font-medium" title={user?.name}>
                     {user?.name}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground truncate" title={user?.email}>
                     {user?.email}
                  </div>
               </div>
            </div>
         );
      },
      size: 200,
   },
   {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
         const message = row.original?.message || "";
         return (
            <div className="max-w-[400px] truncate text-xs text-muted-foreground" title={message}>
               {message}
            </div>
         );
      },
      size: 400,
   },
   {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
         return (
            <div className="text-xs whitespace-nowrap flex flex-col">
               <span className="font-mono text-xs text-muted-foreground">
                  {format(new Date(row.original?.created_at), "dd/MM/yyyy HH:mm:ss")}
               </span>
            </div>
         );
      },
      size: 150,
   },
];
