import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

const formSchema = z.object({
   dispatchId: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export const ReceiveDispatchSetup = ({ setDispatchId }: { setDispatchId: (dispatchId: number) => void }) => {
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

   const onSubmit = (data: FormSchema) => {
      console.log(data);
      setDispatchId(Number(data.dispatchId));
      reset();
   };

   return (
      <div className="flex flex-col">
         <main className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
               <div className="lg:col-span-2 flex flex-col gap-6">
                  <Card>
                     <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                           <InputGroup>
                              <InputGroupInput
                                 placeholder="Search..."
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
                                 Buscar
                              </Button>
                              <Button variant="outline">Recibir sin Despacho</Button>
                           </Field>

                           {errors.dispatchId && <p className="text-red-500">{errors.dispatchId.message}</p>}
                        </form>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </main>
      </div>
   );
};
