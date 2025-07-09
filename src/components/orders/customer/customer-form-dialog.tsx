import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { UserRoundPenIcon, UserRoundPlus } from "lucide-react";
import { z } from "zod";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import { type Customer } from "@/data/types";
import { toast } from "sonner";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";

const customerFormSchema = z.object({
	first_name: z.string().min(1, "El nombre es requerido"),
	middle_name: z.string().optional(),
	last_name: z.string().min(1, "El apellido es requerido"),
	second_last_name: z.string().optional(),
	mobile: z
		.string()
		.min(10, "El movil debe tener 10 dígitos")
		.max(10, "El movil debe tener 10 dígitos"),
	identity_document: z.string().optional(),
	email: z.string().email("El correo electrónico no es válido").optional(),
	address: z.string().optional(),
});

type FormData = z.infer<typeof customerFormSchema>;

export const CustomerFormDialog = React.memo(function CustomerFormDialog() {
	const [isOpen, setIsOpen] = useState(false);
	const [formError, setFormError] = useState("");
	const { selectedCustomer } = useInvoiceStore(
		useShallow((state) => ({
			selectedCustomer: state.selectedCustomer,
		})),
	);

	const form = useForm<FormData>({
		resolver: zodResolver(customerFormSchema),
		defaultValues: {
			first_name: "",
			email: undefined,
			mobile: undefined,
			middle_name: "",
			last_name: "",
			second_last_name: "",
			identity_document: undefined,
			address: undefined,
		},
	});

	useEffect(() => {
		if (selectedCustomer == null) {
			form.reset({
				first_name: "",
				email: undefined,
				mobile: undefined,
				middle_name: "",
				last_name: "",
				second_last_name: "",
				identity_document: undefined,
				address: undefined,
			});
		} else {
			form.reset({
				first_name: selectedCustomer.first_name,
				email: selectedCustomer.email ? selectedCustomer.email : undefined,
				mobile: selectedCustomer.mobile ? selectedCustomer.mobile : undefined,
				middle_name: selectedCustomer.middle_name ? selectedCustomer.middle_name : undefined,
				last_name: selectedCustomer.last_name ? selectedCustomer.last_name : undefined,
				second_last_name: selectedCustomer.second_last_name,
				identity_document: selectedCustomer.identity_document
					? selectedCustomer.identity_document
					: undefined,
				address: selectedCustomer.address ? selectedCustomer.address : undefined,
			});
		}
	}, [selectedCustomer, form]);

	const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer({
		onSuccess: (data: Customer) => {
			setIsOpen(false);
			toast.success("Cliente actualizado correctamente");
			form.reset();
			setFormError("");
			useInvoiceStore.setState({ selectedCustomer: data });
		},
	});

	const { mutate: createCustomer, isPending } = useCreateCustomer({
		onSuccess: (data: Customer) => {
			setIsOpen(false);
			toast.success("Cliente creado correctamente");
			form.reset();
			setFormError("");
			useInvoiceStore.setState({ selectedCustomer: data });
		},
		onError: (error) => {
			setFormError(error.response.data.message);
		},
	});

	const onSubmit = (data: FormData) => {
		if (selectedCustomer !== null) {
			updateCustomer({ id: selectedCustomer.id, data: data as Customer });
		} else {
			createCustomer(data as Customer);
		}
	};

	const onError = (errors: any) => {
		console.log("Form validation errors:", errors);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					{selectedCustomer ? <UserRoundPenIcon /> : <UserRoundPlus />}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-xl-[425px] ">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit, onError)}>
						<DialogHeader>
							<DialogTitle>{selectedCustomer ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
							<DialogDescription>
								{selectedCustomer
									? "Edita los datos del cliente para que puedas usarlo en tus pedidos."
									: "Agrega un nuevo cliente para que puedas usarlo en tus pedidos."}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-6 mt-4">
							<FormField
								control={form.control}
								name="mobile"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Movil</FormLabel>
										<FormControl>
											<Input id="mobile" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 justify-center  gap-4">
								<FormField
									control={form.control}
									name="first_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nombre</FormLabel>
											<FormControl>
												<Input id="first_name" {...field} placeholder="Nombre" />
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
												<Input id="middle_name" {...field} />
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
												<Input id="last_name" {...field} />
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
												<Input id="second_last_name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="identity_document"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Documento de Identidad</FormLabel>
										<FormControl>
											<Input id="identity_document" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Correo Electrónico</FormLabel>
										<FormControl>
											<Input id="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Dirección</FormLabel>
										<FormControl>
											<Input id="address" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex flex-col gap-2 text-center my-4">
							<p className="text-red-500 text-sm">{formError}</p>
						</div>

						<DialogFooter className="flex mt-8 justify-center">
							<Button type="submit" disabled={isPending || isUpdating}>
								{isPending || isUpdating
									? "Guardando..."
									: selectedCustomer
									? "Actualizar"
									: "Guardar"}
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
});
