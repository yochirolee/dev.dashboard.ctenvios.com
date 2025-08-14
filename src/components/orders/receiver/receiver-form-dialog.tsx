import { useEffect, useMemo, useState } from "react";
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
import { UserRoundPenIcon, UserRoundPlus } from "lucide-react";
import { useReceivers } from "@/hooks/use-receivers";
import { type Province, type City, type Receiver, receiverSchema } from "@/data/types";
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
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function ReceiverFormDialog() {
	const { data: provinces } = useProvinces();
	const [ci, setCi] = useState("");
	const { setSelectedReceiver, selectedCustomer, selectedReceiver } = useInvoiceStore(
		useShallow((state) => ({
			setSelectedReceiver: state.setSelectedReceiver,
			selectedCustomer: state.selectedCustomer,
			selectedReceiver: state.selectedReceiver,
		})),
	);
	const [isProvinceOpen, setIsProvinceOpen] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isCityOpen, setIsCityOpen] = useState(false);
	console.log(selectedReceiver, "selectedReceiver");
	const form = useForm<Receiver>({
		resolver: zodResolver(receiverSchema),
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
	useEffect(() => {
		if (selectedReceiver == null) {
			form.reset({
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
			});
		} else {
			form.reset({
				first_name: selectedReceiver.first_name,
				middle_name: selectedReceiver.middle_name,
				last_name: selectedReceiver.last_name,
				second_last_name: selectedReceiver.second_last_name,
				ci: selectedReceiver.ci,
				email: selectedReceiver.email ? selectedReceiver.email : undefined,
				phone: selectedReceiver.phone ? selectedReceiver.phone : undefined,
				mobile: selectedReceiver.mobile ? selectedReceiver.mobile.slice(2) : undefined,
				address: selectedReceiver.address ? selectedReceiver.address : undefined,
				province_id: selectedReceiver.province_id ? selectedReceiver.province_id : undefined,
				city_id: selectedReceiver.city_id ? selectedReceiver.city_id : undefined,
			});
		}
	}, [selectedReceiver, form]);

	const provinceId = form.watch("province_id");
	const cities = useMemo(() => {
		return provinces?.find((province: Province) => province.id === provinceId)?.cities;
	}, [provinceId]);

	const { mutate: createReceiver, isPending } = useReceivers.create(selectedCustomer?.id || 0, {
		onSuccess: (data: Receiver) => {
			setIsOpen(false);
			form.reset();
			setSelectedReceiver(data);
		},
		onError: (error: any) => {
			console.log("Error creating receipt:", error);
		},
	});

	const { mutate: updateReceiver, isPending: isUpdating } = useReceivers.update({
		onSuccess: (data: Receiver) => {
			setIsOpen(false);
			form.reset();
			setSelectedReceiver(data);
		},
		onError: (error: any) => {
			console.log("Error updating receiver:", error);
		},
	});

	const { data: receiver } = useReceivers.getByCI(ci);
	if (receiver && selectedReceiver == null) {
		setSelectedReceiver(receiver);
		setIsOpen(false);
		form.reset();
		setCi("");
	}

	const handleSearchByCi = async (ciValue: string) => {
		if (ciValue?.length === 11) {
			setCi(ciValue);
		}
	};

	const onSubmit = (data: Receiver) => {
		if (data?.email === "") {
			data.email = undefined;
		}
		data.mobile = data.mobile ? `53${data.mobile}` : undefined;

		if (selectedReceiver) {
			updateReceiver({ id: selectedReceiver.id || 0, data });
		} else {
			createReceiver(data as Receiver);
		}
	};

	const onError = (errors: any) => {
		console.log("Form validation errors:", errors);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					{selectedReceiver ? <UserRoundPenIcon /> : <UserRoundPlus />}
					<span className="hidden lg:block">
						{" "}
						{selectedReceiver ? "Editar Destinatario" : "Nuevo Destinatario"}
					</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px]  p-2 ">
				<DialogHeader className="px-4">
					<DialogTitle>
						{selectedReceiver ? "Editar Destinatario" : "Nuevo Destinatario"}
					</DialogTitle>
					<DialogDescription>
						{selectedReceiver
							? "Edita los datos del destinatario para que puedas usarlo en tus pedidos."
							: "Agrega un nuevo destinatario para que puedas usarlo en tus pedidos."}
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
										<FormItem className="mx-auto">
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
													<InputOTP
														onComplete={(value) => {
															field.onChange(value);
															handleSearchByCi(value);
														}}
														className="w-full"
														maxLength={11}
														pattern="[0-9]*"
														{...field}
													>
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
								<Separator />
								<div className="grid lg:grid-cols-2 gap-4">
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
														<Input
															id="phone"
															{...field}
															type="tel"
															maxLength={8}
															pattern="[0-9]{8}"
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

								<div className="grid lg:grid-cols-2 gap-4">
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
								<div className="grid lg:grid-cols-2 gap-4">
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
												<FormLabel>Segundo Apellido</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid lg:grid-cols-2 gap-4">
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
																	"w-full lg:w-[200px] justify-between",
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
																	"w-full lg:w-[200px] justify-between",
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
						</ScrollArea>
						<DialogFooter className="px-4">
							<Button type="submit" disabled={isPending || isUpdating}>
								{isPending || isUpdating ? "Guardando..." : "Guardar"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									form.reset();

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
