import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormItem, FormLabel, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useProviders } from "@/hooks/use-providers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formNewProviderSchema = z.object({
	name: z.string().min(1, { message: "El nombre del proveedor es requerido" }),
	address: z.string().min(1, { message: "La dirección es requerida" }),
	phone: z.string().min(10, { message: "El teléfono debe tener al menos 10 dígitos" }),
	contact: z.string().min(1),
	email: z.string().email({ message: "El email no es válido" }),
	website: z.string().url({ message: "La URL no es válida" }).optional(),
	forwarder_id: z.number().optional(),
});

type FormNewProviderSchema = z.infer<typeof formNewProviderSchema>;

export const NewProviderForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
	const form = useForm<FormNewProviderSchema>({
		resolver: zodResolver(formNewProviderSchema),
		defaultValues: {
			name: "",
			address: "",
			phone: "",
			contact: "",
			email: "",
			website: "",
			forwarder_id: 1,
		},
	});
	const { mutate: createProvider, isPending } = useProviders.create({
		onSuccess: () => {
			form.reset();
			toast.success("Proveedor creado correctamente");
			setOpen(false);
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});
	const onSubmit = (data: FormNewProviderSchema) => {
		createProvider(data);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nombre</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Nombre del proveedor" />
							</FormControl>
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
								<Input {...field} placeholder="Dirección del proveedor" />
							</FormControl>
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
								<Input {...field} placeholder="Teléfono del proveedor" type="tel" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="contact"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Contacto</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Contacto del proveedor" />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input {...field} placeholder="example@example.com" type="email" />
							</FormControl>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="website"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Website</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Website del proveedor" />
							</FormControl>
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin" />
							Guardando...
						</>
					) : (
						"Crear Proveedor"
					)}
				</Button>
			</form>
		</Form>
	);
};
