import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRange {
   from: Date | undefined;
   to: Date | undefined;
}

interface MultiSelectDateRangePickerProps {
   dateRange: DateRange;
   setDateRange: (range: DateRange) => void;
   className?: string;
}

export const MultiSelectDateRangePicker = ({ dateRange, setDateRange, className }: MultiSelectDateRangePickerProps) => {
   const [open, setOpen] = React.useState(false);

   return (
      <div className={cn("flex flex-col gap-3", className)}>
         <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
               <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                     dateRange.to ? (
                        <>
                           {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                     ) : (
                        format(dateRange.from, "LLL dd, y")
                     )
                  ) : (
                     <span>Seleccionar rango de fechas</span>
                  )}
               </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
               <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                     if (range) {
                        setDateRange({
                           from: range.from,
                           to: range.to,
                        });
                        if (range.from && range.to) {
                           setOpen(false);
                        }
                     }
                  }}
                  numberOfMonths={2}
                  captionLayout="dropdown"
                  disabled={(date) => date > new Date()}
               />
            </PopoverContent>
         </Popover>
      </div>
   );
};
