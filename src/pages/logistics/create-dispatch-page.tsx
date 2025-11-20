import { useState, useRef, useEffect } from "react";
import { Barcode, Box, CheckCircle2, AlertTriangle, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAgencies } from "@/hooks/use-agencies";
import { useAppStore } from "@/stores/app-store";

// Types
type ScanStatus = "matched" | "surplus" | "duplicate";
type PackageItem = {
   hbl: string;
   description: string;
   weight: number;
   scannedAt?: Date;
   status: "pending" | "scanned" | "missing" | "created";
};

export const CreateDispatchPage = () => {
   // State
   const [manifestId, setManifestId] = useState("M-2024-001");
   const [expectedPackages, setExpectedPackages] = useState<PackageItem[]>([]);
   const [scannedPackages, setScannedPackages] = useState<
      { hbl: string; status: ScanStatus; timestamp: Date; description?: string }[]
   >([]);
   const [currentInput, setCurrentInput] = useState("");
   const [isSetupMode, setIsSetupMode] = useState(true);
   const [lastScanStatus, setLastScanStatus] = useState<{
      hbl: string;
      status: ScanStatus;
      description?: string;
   } | null>(null);

   const inputRef = useRef<HTMLInputElement>(null);

   const agency_id = useAppStore.getState().agency?.id;

   const { data: items, isLoading: isLoadingItems } = useAgencies.getItems(agency_id ?? 0);

   console.log(items);
   useEffect(() => {
      if (items) {
         setExpectedPackages(
            items.map((item:PackageItem) => ({
               hbl: item.hbl,
               description: item.description,
               weight: item.weight,
               status: "pending",
            }))
         );
         setScannedPackages([]);
         setLastScanStatus(null);
         setCurrentInput("");
         setIsSetupMode(false);
         inputRef.current?.focus();
      }
   }, [items]);
   // Handle scanning
   const handleScan = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentInput.trim()) return;

      const scannedId = currentInput.trim().toUpperCase();

      // Check if already scanned
      const isDuplicate = scannedPackages.some((p) => p.hbl === scannedId);

      if (isDuplicate) {
         const duplicatePackage = expectedPackages.find((p) => p.hbl === scannedId);
         setLastScanStatus({ hbl: scannedId, status: "duplicate", description: duplicatePackage?.description });
         playAudioFeedback("error");
      } else {
         // Check if in manifest
         const manifestPackage = expectedPackages.find((p) => p.hbl === scannedId);
         const inManifest = !!manifestPackage;
         const status: ScanStatus = inManifest ? "matched" : "surplus";

         setScannedPackages((prev) => [
            {
               hbl: scannedId,
               status,
               timestamp: new Date(),
               description: manifestPackage?.description,
            },
            ...prev,
         ]);

         if (inManifest) {
            setExpectedPackages((prev) =>
               prev.map((p) => (p.hbl === scannedId ? { ...p, status: "scanned", scannedAt: new Date() } : p))
            );
            playAudioFeedback("success");
         } else {
            playAudioFeedback("warning");
         }

         setLastScanStatus({ hbl: scannedId, status, description: manifestPackage?.description });
      }

      setCurrentInput("");
   };

   // Mock audio feedback (visual only for this demo)
   const playAudioFeedback = (type: "success" | "warning" | "error") => {
      // In a real app, this would play a sound
      console.log(`Playing ${type} sound`);
   };

   // Statistics
   const totalExpected = expectedPackages.length;
   const totalScanned = scannedPackages.filter((p) => p.status === "matched").length;
   const totalSurplus = scannedPackages.filter((p) => p.status === "surplus").length;
   const progress = totalExpected > 0 ? (totalScanned / totalExpected) * 100 : 0;
   const missingCount = totalExpected - totalScanned;

   // Auto-focus management
   useEffect(() => {
      if (!isSetupMode) {
         const interval = setInterval(() => {
            if (document.activeElement !== inputRef.current) {
               // Optional: keep focus on input for dedicated scanning stations
               // inputRef.current?.focus()
            }
         }, 1000);
         return () => clearInterval(interval);
      }
   }, [isSetupMode]);

   return (
      <div className="flex flex-col">
         <main className="flex-1">
            {/*   {isSetupMode ? (
               <div className="max-w-2xl mx-auto mt-10">
                  <Card className="border-primary/20 shadow-lg shadow-primary/5">
                     <CardHeader>
                        <CardTitle className="text-2xl">Inbound Shipment Setup</CardTitle>
                        <CardDescription>Configure the expected manifest to begin scanning.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Manifest ID</label>
                           <Input
                              value={manifestId}
                              onChange={(e) => setManifestId(e.target.value)}
                              className="font-mono"
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <Button
                              variant="outline"
                              className="h-32 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                              onClick={() => generateDemoManifest(20)}
                           >
                              <Package className="h-8 w-8 text-primary" />
                              <span className="font-bold">Small Batch (20)</span>
                              <span className="text-xs text-muted-foreground">Quick Demo</span>
                           </Button>
                           <Button
                              variant="outline"
                              className="h-32 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                              onClick={() => generateDemoManifest(100)}
                           >
                              <ClipboardList className="h-8 w-8 text-secondary" />
                              <span className="font-bold">Full Shipment (100)</span>
                              <span className="text-xs text-muted-foreground">Standard Load</span>
                           </Button>
                        </div>

                        <div className="relative">
                           <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                           </div>
                           <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-card px-2 text-muted-foreground">Or upload manifest</span>
                           </div>
                        </div>

                        <Button className="w-full" disabled>
                           Upload CSV / JSON
                        </Button>
                     </CardContent>
                  </Card>
               </div>
            ) : ( */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
               {/* Left Column: Scanning & Stats */}
               <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Stats Cards */}
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

                  {/* Scanner Input Area */}
                  <Card>
                     <CardContent>
                        <form onSubmit={handleScan} className="flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                              <label className="text-sm font-medium flex items-center gap-2">
                                 <Barcode className="size-4 text-primary" />
                                 Scan Barcode or Qr Code
                              </label>
                              <span className="text-xs text-muted-foreground animate-pulse">Ready to scan...</span>
                           </div>
                           <div className="flex gap-2">
                              <Input
                                 ref={inputRef}
                                 value={currentInput}
                                 onChange={(e) => setCurrentInput(e.target.value)}
                                 placeholder="Scan or type package ID..."
                                 autoFocus
                              />
                              <Button type="submit">Scan</Button>
                           </div>
                        </form>

                        {/* Last Scan Feedback */}
                        {lastScanStatus && (
                           <div
                              className={`mt-4 p-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                                 lastScanStatus.status === "matched"
                                    ? "bg-green-500/10 border-green-500/30 text-green-500"
                                    : lastScanStatus.status === "surplus"
                                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                                    : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                              }`}
                           >
                              {lastScanStatus.status === "matched" && <CheckCircle2 className="h-6 w-6" />}
                              {lastScanStatus.status === "surplus" && <AlertTriangle className="h-6 w-6" />}
                              {lastScanStatus.status === "duplicate" && <RefreshCw className="h-6 w-6" />}

                              <div className="flex-1">
                                 <p className="font-bold text-lg">{lastScanStatus.hbl}</p>
                                 {lastScanStatus.description && (
                                    <p className="text-xs text-muted-foreground">{lastScanStatus.description}</p>
                                 )}
                                 <p className="text-sm opacity-90">
                                    {lastScanStatus.status === "matched" && "Successfully verified"}
                                    {lastScanStatus.status === "surplus" && "Warning: Not in manifest"}
                                    {lastScanStatus.status === "duplicate" && "Warning: Already scanned"}
                                 </p>
                              </div>
                           </div>
                        )}
                     </CardContent>
                  </Card>

                  {/* Recent Activity Log */}
                  <Card className="flex-1 flex flex-col min-h-0">
                     <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                     </CardHeader>
                     <CardContent className="flex-1 overflow-hidden p-0">
                        <ScrollArea className="h-[calc(100vh-200px)]">
                           <div className="divide-y divide-border">
                              {scannedPackages.length === 0 ? (
                                 <div className="p-8 text-center text-muted-foreground">No packages scanned yet</div>
                              ) : (
                                 scannedPackages.map((pkg) => (
                                    <div
                                       key={pkg.hbl}
                                       className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                                    >
                                       <div className="flex items-center gap-3">
                                          <div>
                                             {pkg.status === "matched" ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                             ) : pkg.status === "surplus" ? (
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                             ) : (
                                                <RefreshCw className="h-4 w-4 text-yellow-500" />
                                             )}
                                          </div>
                                          <div className="flex flex-col">
                                             <span className=" text-sm">{pkg.hbl}</span>
                                             <span className="text-xs text-muted-foreground">{pkg.description}</span>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-4">
                                          <span className="text-xs text-muted-foreground">
                                             {pkg.timestamp.toLocaleTimeString()}
                                          </span>
                                          <Badge
                                             variant={
                                                pkg.status === "matched"
                                                   ? "outline"
                                                   : pkg.status === "surplus"
                                                   ? "destructive"
                                                   : "secondary"
                                             }
                                          >
                                             {pkg.status}
                                          </Badge>
                                       </div>
                                    </div>
                                 ))
                              )}
                           </div>
                        </ScrollArea>
                     </CardContent>
                  </Card>
               </div>

               {/* Right Column: Manifest & Discrepancies */}
               <div className="lg:col-span-1 flex flex-col h-full">
                  <Card className="h-full flex flex-col">
                     <CardHeader>
                        <CardTitle>Manifest Details</CardTitle>
                        <CardDescription>ID: {manifestId}</CardDescription>
                     </CardHeader>
                     <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                        <Tabs defaultValue="pending" className="flex-1 flex flex-col">
                           <div className="px-4">
                              <TabsList className="w-full grid grid-cols-2">
                                 <TabsTrigger value="pending">Pending ({missingCount})</TabsTrigger>
                                 <TabsTrigger value="completed">Verified ({totalScanned})</TabsTrigger>
                              </TabsList>
                           </div>

                           <div className="p-2 px-4">
                              <div className="relative">
                                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                 <Input placeholder="Search manifest..." className="pl-8" />
                              </div>
                           </div>

                           <TabsContent value="pending" className="flex-1 min-h-0 mt-0">
                              <ScrollArea className="h-[calc(100vh-200px)]">
                                 <div className="p-4 space-y-2">
                                    {expectedPackages
                                       .filter((p) => p.status === "pending")
                                       .map((pkg) => (
                                          <div
                                             key={pkg.hbl}
                                             className="flex items-center justify-between p-3 rounded-lg border border-border"
                                          >
                                             <div className="flex items-center gap-3">
                                                <Box className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-mono text-sm">{pkg.hbl}</span>
                                                <span className="text-xs text-muted-foreground">{pkg.description}</span>
                                             </div>
                                             <Badge variant="secondary" className="text-[10px]">
                                                WAITING
                                             </Badge>
                                          </div>
                                       ))}
                                    {expectedPackages.filter((p) => p.status === "pending").length === 0 && (
                                       <div className="text-center py-10 text-muted-foreground">
                                          <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />
                                          <p>All packages verified!</p>
                                       </div>
                                    )}
                                 </div>
                              </ScrollArea>
                           </TabsContent>

                           <TabsContent value="completed" className="flex-1 min-h-0 mt-0">
                              <ScrollArea className="h-full">
                                 <div className="p-4 space-y-2">
                                    {expectedPackages
                                       .filter((p) => p.status === "scanned")
                                       .map((pkg) => (
                                          <div
                                             key={pkg.hbl}
                                             className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/5"
                                          >
                                             <div className="flex items-center gap-3">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                <span className=" text-sm">{pkg.hbl}</span>
                                                <span className="text-xs text-muted-foreground">{pkg.description}</span>
                                             </div>
                                             <span className="text-xs text-muted-foreground">
                                                {pkg.scannedAt?.toLocaleTimeString()}
                                             </span>
                                          </div>
                                       ))}
                                 </div>
                              </ScrollArea>
                           </TabsContent>
                        </Tabs>
                     </CardContent>
                  </Card>
               </div>
            </div>
            {/*   )} */}
         </main>
      </div>
   );
};
