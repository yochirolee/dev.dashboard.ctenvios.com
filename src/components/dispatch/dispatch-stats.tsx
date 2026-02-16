import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "../ui/card";

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

export const DispatchStats = ({
   indicators,
   progressValue = 0,
   showProgress = true,
}: DispatchStatsProps): React.ReactElement => {
   return (
      <div className="flex flex-col ">
         <div className="grid grid-cols-3 gap-4 mx-2 ">
            {indicators.map((indicator, index) => (
               <Card key={index}>
                  <CardContent className=" flex flex-col items-center justify-center text-center">
                     <div className="flex items-center gap-2">
                        <span className={`text-4xl font-bold text-${indicator.color}-500`}>{indicator.value}</span>
                        <span className="text-sm text-muted-foreground">{indicator.label}</span>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>

         {showProgress && (
            <div className="mx-2">
               <Progress value={progressValue} className="my-3 h-2 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
            </div>
         )}
      </div>
   );
};
