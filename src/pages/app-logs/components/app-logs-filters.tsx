import * as React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelectDateRangePicker } from "@/components/dates/multi-select-date-range-picker";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

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
      <div className="flex flex-wrap items-center gap-2">
         {/* Search input */}
         <div className="flex items-center w-48 relative">
            <Search className="w-4 h-4 absolute left-3" />
            <Input
               type="search"
               className="pl-9 h-8"
               placeholder="Buscar por ruta..."
               value={filters.path || ""}
               onChange={(e) => handleFilterChange("path", e.target.value)}
            />
         </div>

         {/* Faceted filters */}
         <DataTableFacetedFilter
            title="Nivel"
            options={LOG_LEVELS.map((level) => ({ value: level, label: level }))}
            selectedValue={filters.level}
            onSelect={(value) => handleFilterChange("level", value)}
         />
         <DataTableFacetedFilter
            title="Método"
            options={HTTP_METHODS.map((method) => ({ value: method, label: method }))}
            selectedValue={filters.method}
            onSelect={(value) => handleFilterChange("method", value)}
         />
         <DataTableFacetedFilter
            title="Estado"
            options={STATUS_CODES.map((code) => ({ value: code.toString(), label: code.toString() }))}
            selectedValue={filters.status_code?.toString()}
            onSelect={(value) => handleFilterChange("status_code", value ? Number(value) : undefined)}
         />

         {/* Text inputs */}
         <Input
            placeholder="Fuente"
            className="w-32 h-8"
            value={filters.source || ""}
            onChange={(e) => handleFilterChange("source", e.target.value)}
         />
         <Input
            placeholder="ID de usuario"
            className="w-36 h-8"
            value={filters.user_id || ""}
            onChange={(e) => handleFilterChange("user_id", e.target.value)}
         />

         {/* Date range */}
         <MultiSelectDateRangePicker
            dateRange={dateRange}
            setDateRange={handleDateRangeChange}
         />

         {/* Reset button */}
         {hasActiveFilters && (
            <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2">
               Reset
               <X className="ml-1 w-4 h-4" />
            </Button>
         )}
      </div>
   );
};
