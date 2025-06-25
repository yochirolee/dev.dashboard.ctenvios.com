import React, { useState } from "react";
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
import { UserRoundPlus } from "lucide-react";
import { z } from "zod";
import { useCreateCustomer } from "@/hooks/use-customers";
import { type Customer, customerSchema } from "@/data/types";
import { toast } from "sonner";
import { useInvoiceStore } from "@/stores/invoice-store";

export const CustomerFormDialog = React.memo(function CustomerFormDialog() {
	// Only get setValue, don't subscribe to form changes
	const [isOpen, setIsOpen] = useState(false);
	const [formError, setFormError] = useState("");

	const form = useForm<z.infer<typeof customerSchema>>({
		resolver: zodResolver(customerSchema),
		defaultValues: {
			first_name: "",
			second_name: undefined,
			last_name: "",
			second_last_name: "",
			identity_document: undefined,
			email: undefined,
			phone: "",
			address: undefined,
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
			console.log("Error creating customer:", error);
			setFormError(error.message);
		},
	});

	const onSubmit = (data: z.infer<typeof customerSchema>) => {
		if (data?.email === "") {
			data.email = undefined;
		}
		createCustomer(data as Customer);
	};

	const onError = (errors: any) => {
		console.log("Form validation errors:", errors);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<UserRoundPlus />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-xl-[425px] ">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit, onError)}>
						<DialogHeader>
							<DialogTitle>Nuevo Cliente</DialogTitle>
							<DialogDescription>
								Agrega un nuevo cliente para que puedas usarlo en tus pedidos.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-6 mt-4">
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Teléfono</FormLabel>
										<FormControl>
											<Input id="phone" {...field} />
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
									name="second_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Segundo Nombre (Opcional)</FormLabel>
											<FormControl>
												<Input id="second_name" {...field} />
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
});
