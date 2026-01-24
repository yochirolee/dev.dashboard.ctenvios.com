import { Progress } from "@/components/ui/progress";

interface StatIndicator {
   label: string;
   value: number;
   total?: number;
   color: "emerald" | "blue" | "orange" | "red" | "gray";
}

interface DispatchStatsProps {
   indicators: StatIndicator[];
   progressValue?: number;
   showProgress?: boolean;
}

const colorMap = {
   emerald: "bg-emerald-600",
   blue: "bg-blue-500",
   orange: "bg-orange-500",
   red: "bg-red-500",
   gray: "bg-gray-500",
};

export const DispatchStats = ({
   indicators,
   progressValue = 0,
   showProgress = true,
}: DispatchStatsProps): React.ReactElement => {
   return (
      <>
         <div className="flex flex-wrap items-center gap-4 mt-6">
            {indicators.map((indicator, index) => (
               <div key={index} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${colorMap[indicator.color]}`} />
                  <span className="text-sm text-muted-foreground">
                     {indicator.total !== undefined
                        ? `${indicator.value} de ${indicator.total} ${indicator.label}`
                        : `${indicator.value} ${indicator.label}`}
                  </span>
               </div>
            ))}
         </div>

         {showProgress && (
            <Progress
               value={progressValue}
               className="mt-3 h-2 [&>[data-slot=progress-indicator]]:bg-emerald-500"
            />
         )}
      </>
   );
};
