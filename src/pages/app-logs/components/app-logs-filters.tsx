import * as React from "react";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectDateRangePicker } from "@/components/dates/multi-select-date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface AppLogsFilters {
   level?: string;
   source?: string;
   status_code?: number;
   user_id?: string;
   path?: string;
   method?: string;
   startDate?: Date;
   endDate?: Date;
}

interface AppLogsFiltersProps {
   filters: AppLogsFilters;
   onFiltersChange: (filters: AppLogsFilters) => void;
   onClearFilters: () => void;
}

const LOG_LEVELS = ["HTTP", "INFO", "WARN", "ERROR"] as const;
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
const STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 500] as const;

export const AppLogsFiltersComponent = ({ filters, onFiltersChange, onClearFilters }: AppLogsFiltersProps) => {
   const [isOpen, setIsOpen] = React.useState(false);
   const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
      from: filters.startDate,
      to: filters.endDate,
   });

   const hasActiveFilters = React.useMemo(() => {
      return !!(
         filters.level ||
         filters.source ||
         filters.status_code !== undefined ||
         filters.user_id ||
         filters.path ||
         filters.method ||
         filters.startDate ||
         filters.endDate
      );
   }, [filters]);

   const handleDateRangeChange = React.useCallback(
      (range: { from: Date | undefined; to: Date | undefined }) => {
         setDateRange(range);
         onFiltersChange({
            ...filters,
            startDate: range.from,
            endDate: range.to,
         });
      },
      [filters, onFiltersChange]
   );

   const handleFilterChange = React.useCallback(
      (key: keyof AppLogsFilters, value: string | number | undefined) => {
         onFiltersChange({
            ...filters,
            [key]: value === "" || value === undefined || value === "all" ? undefined : value,
         });
      },
      [filters, onFiltersChange]
   );

   const handleClearFilters = React.useCallback(() => {
      setDateRange({ from: undefined, to: undefined });
      onClearFilters();
   }, [onClearFilters]);

   return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
         <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
               <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                     <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {Object.values(filters).filter((v) => v !== undefined && v !== "").length}
                     </span>
                  )}
               </Button>
            </CollapsibleTrigger>
            {hasActiveFilters && (
               <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2">
                  Limpiar
                  <X className="h-4 w-4" />
               </Button>
            )}
         </div>
         <CollapsibleContent className="mt-2">
            <Card>
               <CardHeader>
                  <CardTitle className="text-sm">Filtros de Logs</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Nivel</label>
                        <Select
                           value={filters.level || "all"}
                           onValueChange={(value) => handleFilterChange("level", value)}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder="Todos los niveles" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">Todos los niveles</SelectItem>
                              {LOG_LEVELS.map((level) => (
                                 <SelectItem key={level} value={level}>
                                    {level}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Método HTTP</label>
                        <Select
                           value={filters.method || "all"}
                           onValueChange={(value) => handleFilterChange("method", value)}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder="Todos los métodos" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">Todos los métodos</SelectItem>
                              {HTTP_METHODS.map((method) => (
                                 <SelectItem key={method} value={method}>
                                    {method}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Código de Estado</label>
                        <Select
                           value={filters.status_code?.toString() || "all"}
                           onValueChange={(value) =>
                              handleFilterChange("status_code", value === "all" ? undefined : Number(value))
                           }
                        >
                           <SelectTrigger>
                              <SelectValue placeholder="Todos los códigos" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="all">Todos los códigos</SelectItem>
                              {STATUS_CODES.map((code) => (
                                 <SelectItem key={code} value={code.toString()}>
                                    {code}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>

                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Fuente</label>
                        <Input
                           placeholder="Filtrar por fuente"
                           value={filters.source || ""}
                           onChange={(e) => handleFilterChange("source", e.target.value)}
                        />
                     </div>

                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Ruta</label>
                        <Input
                           placeholder="Filtrar por ruta"
                           value={filters.path || ""}
                           onChange={(e) => handleFilterChange("path", e.target.value)}
                        />
                     </div>

                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">ID de Usuario</label>
                        <Input
                           placeholder="Filtrar por ID de usuario"
                           value={filters.user_id || ""}
                           onChange={(e) => handleFilterChange("user_id", e.target.value)}
                        />
                     </div>

                     <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                        <label className="text-sm font-medium">Rango de Fechas</label>
                        <MultiSelectDateRangePicker
                           dateRange={dateRange}
                           setDateRange={handleDateRangeChange}
                           className="w-full"
                        />
                     </div>
                  </div>
               </CardContent>
            </Card>
         </CollapsibleContent>
      </Collapsible>
   );
};
