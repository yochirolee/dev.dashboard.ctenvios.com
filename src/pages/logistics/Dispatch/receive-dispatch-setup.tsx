import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Search, Package, Truck, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const formSchema = z.object({
   dispatchId: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

type ReceiveMode = "with-dispatch" | "without-dispatch";

interface ReceiveDispatchSetupProps {
   setDispatchId: (dispatchId: number) => void;
   setMode: (mode: ReceiveMode) => void;
}

export const ReceiveDispatchSetup = ({ setDispatchId, setMode }: ReceiveDispatchSetupProps) => {
   const form = useForm<FormSchema>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         dispatchId: undefined,
      },
   });
   const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
   } = form;

   const onSubmit = (data: FormSchema): void => {
      if (data.dispatchId) {
         setDispatchId(Number(data.dispatchId));
         setMode("with-dispatch");
      }
      reset();
   };

   const handleWithoutDispatch = (): void => {
      setMode("without-dispatch");
   };

   return (
      <div className="flex flex-col p-2 md:p-4">
         <main className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
               {/* Option 1: With Dispatch */}
               <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Recibir con Despacho
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                        Busca un despacho existente y verifica los paquetes escaneando cada uno.
                     </p>
                     <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <InputGroup>
                           <InputGroupInput
                              placeholder="ID del despacho..."
                              {...register("dispatchId")}
                              aria-invalid={!!errors.dispatchId}
                              aria-describedby={errors.dispatchId ? errors.dispatchId.message : undefined}
                           />
                           <InputGroupAddon>
                              <Search />
                           </InputGroupAddon>
                        </InputGroup>
                        <Field orientation="responsive">
                           <Button type="submit" className="w-full">
                              <Search className="h-4 w-4 mr-2" />
                              Buscar Despacho
                           </Button>
                        </Field>
                        {errors.dispatchId && <p className="text-red-500 text-sm">{errors.dispatchId.message}</p>}
                     </form>
                  </CardContent>
               </Card>

               {/* Option 2: Without Dispatch */}
               <Card className="border-2 hover:border-orange-500/50 transition-colors">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-orange-500" />
                        Recibir sin Despacho
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-muted-foreground mb-4">
                        Escanea los paquetes uno por uno y crea un despacho nuevo automáticamente.
                     </p>
                     <Button
                        onClick={handleWithoutDispatch}
                        variant="outline"
                        className="w-full border-orange-500/50 hover:bg-orange-500/10"
                     >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Comenzar sin Despacho
                     </Button>
                  </CardContent>
               </Card>
            </div>
         </main>
      </div>
   );
};
