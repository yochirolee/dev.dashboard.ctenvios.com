import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserRoundPlus } from "lucide-react";
import { useReceipts } from "@/hooks/use-receipts";
import { type Province, type City, type Receipt, receiptShema } from "@/data/types";
import { isValidCubanCI } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useProvinces } from "@/hooks/use-provinces";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InputOTP } from "@/components/ui/input-otp";
import { InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";

export function ReceiptFormDialog({ expand = false }: { expand?: boolean }) {
	const { setSelectedReceipt, selectedCustomer } = useInvoiceStore(
		useShallow((state) => ({
			setSelectedReceipt: state.setSelectedReceipt,
			selectedCustomer: state.selectedCustomer,
		})),
	);
	const [isOpen, setIsOpen] = useState(false);
	const [isProvinceOpen, setIsProvinceOpen] = useState(false);
	const [isCityOpen, setIsCityOpen] = useState(false);

	const [formError, setFormError] = useState("");
	const { data: provinces } = useProvinces();

	const form = useForm<Receipt>({
		resolver: zodResolver(receiptShema),
		defaultValues: {
			first_name: "",
			middle_name: "",
			last_name: "",
			second_last_name: "",
			ci: "",
			email: undefined,
			phone: "",
			mobile: "",
			address: "",
			province_id: undefined,
			city_id: undefined,
			passport: undefined,
		},
	});

	const cities = useMemo(() => {
		return provinces?.find((province: Province) => province.id === form.getValues().province_id)
			?.cities;
	}, [form.getValues().province_id, provinces]);

	const { mutate: createReceipt, isPending } = useReceipts.create(selectedCustomer?.id || 0, {
		onSuccess: (data: Receipt) => {
			setIsOpen(false);
			form.reset();
			setFormError("");
			setSelectedReceipt(data);
		},
		onError: (error: any) => {
			console.log("Error creating receipt:", error);
			setFormError(error.message);
		},
	});

	const onSubmit = (data: Receipt) => {
		if (data?.email === "") {
			data.email = undefined;
		}
		data.phone = data.mobile ? `53${data.mobile}` : undefined;
		
		createReceipt(data as Receipt);
	};

	const onError = (errors: any) => {
		console.log("Form validation errors:", errors);
	};

	console.log(form.formState.errors);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<UserRoundPlus />
					{expand && "Crear Destinatario"}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px] p-2 ">
				<DialogHeader className="px-4">
					<DialogTitle>Crear Cliente</DialogTitle>
					<DialogDescription>
						Por favor, complete el formulario para crear un nuevo cliente.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit, onError)}>
						<ScrollArea className="h-[calc(100vh-200px)] px-4">
							<div className="grid  gap-1  space-y-6 mt-4">
								<FormField
									control={form.control}
									name="ci"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Carne de Identidad
												{!isValidCubanCI(field.value) ? (
													<span className="text-destructive">*</span>
												) : (
													<span className="98 text-green-600">*</span>
												)}
											</FormLabel>
											<FormControl>
												<div className="inline-flex items-center gap-3">
													<InputOTP maxLength={11} pattern="[0-9]*" {...field}>
														<InputOTPGroup>
															<InputOTPSlot index={0} />
															<InputOTPSlot index={1} />
															<InputOTPSlot index={2} />
															<InputOTPSlot index={3} />
															<InputOTPSlot index={4} />
															<InputOTPSlot index={5} />
															<InputOTPSlot index={6} />
															<InputOTPSlot index={7} />
															<InputOTPSlot index={8} />
															<InputOTPSlot index={9} />
															<InputOTPSlot index={10} />
														</InputOTPGroup>
													</InputOTP>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="mobile"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Teléfono Celular</FormLabel>
												<FormControl>
													<div className="flex">
														<span className="inline-flex items-center px-3 text-sm border  border-r-0  rounded-l-md">
															+53
														</span>
														<Input
															id="mobile"
															{...field}
															type="tel"
															maxLength={8}
															pattern="[0-9]{8}"
															className="rounded-l-none"
															placeholder="12345678"
															onChange={(e) => {
																// Only allow digits and limit to 8 characters
																const value = e.target.value.replace(/\D/g, "").slice(0, 8);
																field.onChange(value);
															}}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Teléfono</FormLabel>
												<FormControl>
													<div className="flex">
														<span className="inline-flex items-center px-3 text-sm border  border-r-0  rounded-l-md">
															+53
														</span>
														<Input
															id="phone"
															{...field}
															type="tel"
															maxLength={8}
															pattern="[0-9]{8}"
															className="rounded-l-none"
															placeholder="12345678"
															onChange={(e) => {
																// Only allow digits and limit to 8 characters
																const value = e.target.value.replace(/\D/g, "").slice(0, 8);
																field.onChange(value);
															}}
														/>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Correo Electrónico</FormLabel>
											<FormControl>
												<Input {...field} value={field.value || ""} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Separator />

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="first_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nombre</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="middle_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Segundo Nombre (Opcional)</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="last_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Apellido</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="second_last_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>2 Apellido</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="province_id"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Provincia</FormLabel>
												<Popover open={isProvinceOpen} onOpenChange={setIsProvinceOpen}>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																role="combobox"
																className={cn(
																	"w-[200px] justify-between",
																	!field.value && "text-muted-foreground",
																)}
															>
																{field.value
																	? provinces?.find(
																			(province: Province) => province.id === field.value,
																	  )?.name
																	: "Seleccionar Provincia"}
																<ChevronsUpDown className="opacity-50" />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-[200px] p-0">
														<Command>
															<CommandInput placeholder="Buscar Provincia..." className="h-9" />
															<CommandList>
																<CommandEmpty>No Provincias encontradas.</CommandEmpty>
																<CommandGroup>
																	{provinces?.map((province: Province) => (
																		<CommandItem
																			value={province.name}
																			key={province.id}
																			onSelect={() => {
																				form.setValue("province_id", province.id);
																				setIsProvinceOpen(false);
																			}}
																		>
																			{province.name}
																			<Check
																				className={cn(
																					"ml-auto",
																					province.id === field.value ? "opacity-100" : "opacity-0",
																				)}
																			/>
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>

												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="city_id"
										render={({ field }) => (
											<FormItem className="flex flex-col">
												<FormLabel>Municipio</FormLabel>
												<Popover open={isCityOpen} onOpenChange={setIsCityOpen}>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																role="combobox"
																className={cn(
																	"w-[200px] justify-between",
																	!field.value && "text-muted-foreground",
																)}
															>
																{field?.value
																	? cities?.find((city: City) => city.id === field.value)?.name
																	: "Seleccionar Municipio"}
																<ChevronsUpDown className="opacity-50" />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-[200px] p-0">
														<Command>
															<CommandInput placeholder="Buscar Municipio..." className="h-9" />
															<CommandList>
																<CommandEmpty>No Municipios encontrados.</CommandEmpty>
																<CommandGroup>
																	{cities?.map((city: City) => (
																		<CommandItem
																			value={city.name}
																			key={city.id}
																			onSelect={() => {
																				form.setValue("city_id", city.id);
																				setIsCityOpen(false);
																			}}
																		>
																			{city.name}
																			<Check
																				className={cn(
																					"ml-auto",
																					city.id === field.value ? "opacity-100" : "opacity-0",
																				)}
																			/>
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>

												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 mt-4 items-center gap-4">
									<Label htmlFor="address" className="text-right">
										Dirección
									</Label>
									<Input id="address" {...form.register("address")} />
									<p className="text-red-500 text-sm">{form.formState.errors.address?.message}</p>
								</div>
							</div>
							<div className="flex flex-col gap-2 text-center my-4">
								{formError && <p className="text-red-500 text-sm">{formError}</p>}
							</div>
						</ScrollArea>
						<DialogFooter className="px-4">
							<Button type="submit" disabled={isPending}>
								{isPending ? "Guardando..." : "Guardar"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									form.reset();
									setFormError("");
									setIsOpen(false);
								}}
							>
								Cancelar
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
