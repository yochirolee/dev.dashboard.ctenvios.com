import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { type Agency, agencySchema, userSchema } from "@/data/types";
import { useAgencies } from "@/hooks/use-agencies";
import { useNavigate } from "react-router-dom";

const createAgencyFormSchema = z.object({
   agency: agencySchema,
   user: userSchema,
});

export type CreateAgencyFormSchema = z.infer<typeof createAgencyFormSchema>;

export function NewAgencyPage() {
   const navigate = useNavigate();
   const form = useForm<CreateAgencyFormSchema>({
      resolver: zodResolver(createAgencyFormSchema),
      defaultValues: {
         agency: {
            name: "",
            address: "",
            contact: "",
            phone: "",
            email: "",
            website: "",
            agency_type: "AGENCY",
            parent_agency_id: undefined,
         },
         user: {
            email: "",
            password: "",
            phone: "",
            repeat_password: "",
            role: "AGENCY_ADMIN",
            name: "",
         },
      },
      shouldUnregister: false, // mantiene valores entre steps
      mode: "onTouched", // Solo valida cuando el campo ha sido tocado
      reValidateMode: "onBlur", // Revalida cuando el usuario sale del campo
   });

   const { data: agencies = [] } = useAgencies.get();
   const { mutate: createAgency, isPending } = useAgencies.create({
      onSuccess: () => {
         toast.success("Agencia creada correctamente");
         form.reset();
         navigate("/settings/agencies");
      },
      onError: (error) => {
         toast.error(error.response.data.message);
      },
   });

   const onSubmit = async (formData: CreateAgencyFormSchema) => {
      // Solo se ejecuta en el último paso
      if (step === totalSteps - 1) {
         // Validar antes de crear
         const userFields = ["user.name", "user.email", "user.phone", "user.password", "user.repeat_password"] as const;

         const ok = await form.trigger(userFields as any, {
            shouldFocus: true,
         });

         if (!ok) {
            console.log(form.formState.errors, "errors");
            toast.error("Revisa los campos del paso actual");
            return;
         }

         // Validar el schema completo para ejecutar el .refine() de password
         const userData = form.getValues("user");
         const userResult = userSchema.safeParse(userData);
         if (!userResult.success) {
            toast.error("Revisa los campos del paso actual");
            form.setError("user", {
               type: "manual",
               message: "Hay errores en los campos del usuario",
            });
            return;
         }

         // Crear la agencia
         console.log(formData);
         createAgency(formData);
      }
   };

   const totalSteps = 2;
   const [step, setStep] = useState(0);

   // Limpiar errores del paso actual cuando cambia el step
   useEffect(() => {
      if (step === 1) {
         // Limpiar errores del paso de usuario al entrar
         form.clearErrors("user");
      } else if (step === 0) {
         // Limpiar errores del paso de agencia al volver
         form.clearErrors("agency");
      }
   }, [step, form]);

   // 4) Validación por paso
   const handleNext = async () => {
      if (step === 0) {
         console.log("step 0");
         // Validar todos los campos de agency
         const agencyFields = [
            "agency.name",
            "agency.address",
            "agency.contact",
            "agency.phone",
            "agency.agency_type",
            "agency.parent_agency_id",
         ] as const;

         const ok = await form.trigger(agencyFields as any, {
            shouldFocus: true,
         });

         if (!ok) {
            console.log(form.formState.errors, "errors");
            const errors = form.formState.errors.agency;
            if (errors?.parent_agency_id) {
               toast.error("La agencia padre es requerida para tipos AGENCY y RESELLER");
            } else {
               toast.error("Revisa los campos del paso actual");
            }
            return;
         }

         // Validar el schema completo para ejecutar el .refine()
         const agencyData = form.getValues("agency");
         const agencyResult = agencySchema.safeParse(agencyData);
         if (!agencyResult.success) {
            const errors = agencyResult.error.flatten().fieldErrors;
            if (errors.parent_agency_id) {
               toast.error("La agencia padre es requerida para tipos AGENCY y RESELLER");
            } else {
               toast.error("Revisa los campos del paso actual");
            }
            // Establecer los errores en el form
            form.setError("agency", {
               type: "manual",
               message: "Hay errores en los campos de la agencia",
            });
            return;
         }
      } else if (step === 1) {
         // Validar todos los campos de user
         const userFields = ["user.name", "user.email", "user.phone", "user.password", "user.repeat_password"] as const;

         const ok = await form.trigger(userFields as any, {
            shouldFocus: true,
         });

         if (!ok) {
            console.log(form.formState.errors, "errors");
            toast.error("Revisa los campos del paso actual");
            return;
         }

         // Validar el schema completo para ejecutar el .refine() de password
         const userData = form.getValues("user");
         const userResult = userSchema.safeParse(userData);
         if (!userResult.success) {
            toast.error("Revisa los campos del paso actual");
            form.setError("user", {
               type: "manual",
               message: "Hay errores en los campos del usuario",
            });
            return;
         }
      }

      // Limpiar errores del siguiente paso antes de avanzar
      const nextStep = Math.min(step + 1, totalSteps - 1);
      if (nextStep === 1) {
         // Limpiar errores del paso de usuario
         form.clearErrors("user");
      }

      setStep(nextStep);
   };

   const handleBack = () => setStep((s) => Math.max(s - 1, 0));

   return (
      <div className="space-y-4 p-2 md:p-4">
         {/* Progress */}
         <div className="flex items-center justify-center">
            {Array.from({ length: totalSteps }).map((_, index) => (
               <div key={index} className="flex items-center">
                  <div
                     className={cn(
                        "w-4 h-4 rounded-full transition-all duration-300 ease-in-out",
                        index <= step ? "bg-primary" : "bg-primary/30",
                        index < step && "bg-primary"
                     )}
                  />
                  {index < totalSteps - 1 && (
                     <div className={cn("w-8 h-0.5", index < step ? "bg-primary" : "bg-primary/30")} />
                  )}
               </div>
            ))}
         </div>

         <Card className="shadow-sm container mx-auto max-w-5xl">
            <CardHeader>
               <CardTitle className="text-lg">Crear Agencia</CardTitle>
               <CardDescription>Crea una nueva agencia</CardDescription>
            </CardHeader>
            <Separator />

            <CardContent>
               <Form {...form}>
                  {/* IMPORTANTE: un único <form> que solo hace submit en el último paso */}
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-6">
                     {/* PASO 0 */}
                     {step === 0 && (
                        <div className="grid gap-6">
                           <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium">Información de la Agencia</h3>
                              <p className="text-sm text-muted-foreground">
                                 Llena todos los campos requeridos para crear una nueva agencia.
                              </p>
                           </div>

                           <div className="grid lg:grid-cols-2 gap-6">
                              <FormField
                                 control={form.control}
                                 name="agency.name"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Nombre de la Agencia *</FormLabel>
                                       <FormControl>
                                          <Input {...field} placeholder="Nombre de la Agencia" autoComplete="off" />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="agency.address"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Dirección *</FormLabel>
                                       <FormControl>
                                          <Input {...field} placeholder="Dirección de la Agencia" autoComplete="off" />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="agency.contact"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Persona de Contacto *</FormLabel>
                                       <FormControl>
                                          <Input {...field} placeholder="Nombre y Apellidos" autoComplete="off" />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="agency.phone"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Teléfono de Contacto *</FormLabel>
                                       <FormControl>
                                          <Input {...field} placeholder="Teléfono" autoComplete="off" />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="agency.email"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Email de Contacto *</FormLabel>
                                       <FormControl>
                                          <Input {...field} placeholder="Email" autoComplete="off" />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="agency.website"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Sitio Web de la Agencia</FormLabel>
                                       <FormControl>
                                          <Input {...field} placeholder="Website" autoComplete="off" />
                                       </FormControl>
                                   
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                              <FormField
                                 control={form.control}
                                 name="agency.parent_agency_id"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Agencia Padre</FormLabel>
                                       <FormControl>
                                          <Select
                                             onValueChange={(value) => field.onChange(Number(value))}
                                             value={field.value?.toString()}
                                          >
                                             <FormControl>
                                                <SelectTrigger className="w-full">
                                                   <SelectValue placeholder="Selecciona la agencia padre" />
                                                </SelectTrigger>
                                             </FormControl>
                                             <SelectContent>
                                                {agencies.map((agency: Agency) => (
                                                   <SelectItem key={agency.id} value={agency.id?.toString() ?? ""}>
                                                      {agency.name}
                                                   </SelectItem>
                                                ))}
                                             </SelectContent>
                                          </Select>
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                              <FormField
                                 control={form.control}
                                 name="agency.agency_type"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Tipo de Agencia *</FormLabel>
                                       <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                             <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecciona el tipo" />
                                             </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                             <SelectItem value="FORWARDER">Forwarder</SelectItem>
                                             <SelectItem value="RESELLER">Revendedor</SelectItem>
                                             <SelectItem value="AGENCY">Agencia</SelectItem>
                                          </SelectContent>
                                       </Select>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>
                        </div>
                     )}

                     {/* PASO 1: Usuario de Agencia */}
                     {step === 1 && (
                        <div className="grid gap-6">
                           <h3 className="text-lg font-medium">Administrador de la Agencia</h3>
                           <div className="grid lg:grid-cols-1  gap-6">
                              <FormField
                                 control={form.control}
                                 name="user.name"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Nombre Completo *</FormLabel>
                                       <FormControl>
                                          <Input type="text" {...field} placeholder="Nombre Completo" />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="user.email"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Email *</FormLabel>
                                       <FormControl>
                                          <Input type="email" {...field} placeholder="Email" />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                              <FormField
                                 control={form.control}
                                 name="user.phone"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Teléfono *</FormLabel>
                                       <FormControl>
                                          <Input type="tel" {...field} placeholder="Teléfono" />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="user.password"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Contraseña *</FormLabel>
                                       <FormControl>
                                          <Input type="password" {...field} placeholder="Contraseña" />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                              <FormField
                                 control={form.control}
                                 name="user.repeat_password"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel>Repetir Contraseña *</FormLabel>
                                       <FormControl>
                                          <Input type="password" {...field} placeholder="Repetir Contraseña" />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>
                        </div>
                     )}

                     {/* Controles */}
                     <div className="flex justify-between">
                        <Button
                           type="button"
                           className="font-medium"
                           size="sm"
                           onClick={handleBack}
                           disabled={step === 0}
                        >
                           Volver
                        </Button>

                        {step === totalSteps - 1 ? (
                           <Button type="submit" size="sm" className="font-medium" disabled={isPending}>
                              {isPending ? (
                                 <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Creando...{" "}
                                 </>
                              ) : (
                                 "Crear Agencia"
                              )}
                           </Button>
                        ) : (
                           <Button type="button" size="sm" className="font-medium" onClick={handleNext}>
                              Siguiente
                           </Button>
                        )}
                     </div>
                  </form>
               </Form>
            </CardContent>
         </Card>
      </div>
   );
}

/* const NewRatesForm = ({
	handleCreateRate,
	services,
}: {
	handleCreateRate: (rate: Rate) => void;
	services: any[];
}) => {
	const [open, setOpen] = useState(false);

	const form = useForm<z.infer<typeof rateSchema>>({
		resolver: zodResolver(rateSchema),

		defaultValues: {
			service_id: undefined,
			name: "",
			agency_rate: 0,
			public_rate: 0,
		},
	});

	console.log(services, "services");

	const { watch } = form;
	console.log(watch(), "rates");

	const onSubmit = (data: z.infer<typeof rateSchema>) => {
		console.log("rates forms");

		data.public_rate = dollarsToCents(data.public_rate);
		data.agency_rate = dollarsToCents(data.agency_rate);

		handleCreateRate(data as Rate);
		setOpen(false);
	};

	console.log(form.formState.errors, "errors");

	return (
		<div className="flex flex-col gap-2">
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild className="w-fit">
					<Button variant="outline">
						<Plus className="w-4 h-4" />
						Crear Tarifa
					</Button>
				</DialogTrigger>

				<DialogContent>
					<DialogHeader>
						<DialogTitle>Crear Tarifa</DialogTitle>
					</DialogHeader>

					<Form {...form}>
						<div className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nombre de la Tarifa *</FormLabel>
										<FormControl>
											<Input type="text" {...field} placeholder="Nombre de la Tarifa" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="service_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Servicio *</FormLabel>
										<Select
											onValueChange={(value) => field.onChange(Number(value))}
											value={field.value?.toString()}
										>
											<FormControl>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Selecciona el servicio" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{services?.map((service: any) => (
													<SelectItem key={service.id} value={service.id.toString()}>
														<div className="flex space-x-4 items-center">
															<p className="text-sm font-medium">{service.provider}</p>
															<Badge variant="outline" className="text-xs">
																{service.service_type}
															</Badge>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="agency_rate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tarifa Agencia *</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
												placeholder="0.00"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="public_rate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tarifa de Venta Agencia*</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
												placeholder="0.00"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								className="w-full"
								onClick={form.handleSubmit(onSubmit)}
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Guardando...
									</>
								) : (
									"Crear Tarifa"
								)}
							</Button>
						</div>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}; */
