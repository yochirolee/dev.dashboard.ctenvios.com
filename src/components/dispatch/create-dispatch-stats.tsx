import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
export const CreateDispatchStats = () => {
   const progress = 0;
   const totalScanned = 0;
   const totalExpected = 0;
   const missingCount = 0;
   const totalSurplus = 0;
   return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
               <span className="text-xs text-muted-foreground uppercase tracking-wider">Progress</span>
               <span className="text-3xl font-bold text-primary mt-1">{Math.round(progress)}%</span>
               <Progress value={progress} className="h-1 mt-2 w-full" />
            </CardContent>
         </Card>
         <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
               <span className="text-xs text-muted-foreground uppercase tracking-wider">Scanned</span>
               <span className="text-3xl font-bold text-foreground mt-1">{totalScanned}</span>
               <span className="text-xs text-muted-foreground">of {totalExpected}</span>
            </CardContent>
         </Card>
         <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
               <span className="text-xs text-muted-foreground uppercase tracking-wider">Missing</span>
               <span className="text-3xl font-bold text-orange-500 mt-1">{missingCount}</span>
               <span className="text-xs text-muted-foreground">Pending</span>
            </CardContent>
         </Card>
         <Card className={` ${totalSurplus > 0 ? "border-red-500/50 bg-red-500/10" : ""}`}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
               <span className="text-xs text-muted-foreground uppercase tracking-wider">Surplus</span>
               <span className="text-3xl font-bold text-red-500 mt-1">{totalSurplus}</span>
               <span className="text-xs text-muted-foreground">Unexpected</span>
            </CardContent>
         </Card>
      </div>
   );
};
