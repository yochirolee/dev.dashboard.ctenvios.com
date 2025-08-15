import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormItem, FormLabel, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAgencies } from "@/hooks/use-agencies";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

const formNewAgencySchema = z.object({
	name: z.string().min(1, { message: "El nombre de la agencia es requerido" }),
	address: z.string().min(1, { message: "La dirección es requerida" }),
	phone: z.string().min(10, { message: "El teléfono debe tener al menos 10 dígitos" }),
	contact: z.string().min(1),
	parent_agency_id: z.number().optional(),
	email: z.string().email({ message: "El email no es válido" }),
	website: z.string().url().optional(),
	forwarder_id: z.number().optional(),
	logo: z.string().url().optional(),
});

type FormNewAgencySchema = z.infer<typeof formNewAgencySchema>;

export const NewAgencyForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
	const form = useForm<FormNewAgencySchema>({
		resolver: zodResolver(formNewAgencySchema),
		defaultValues: {
			name: "",
			address: "",
			phone: "",
			contact: "",
			email: "",
			website: undefined,
			logo: undefined,
		},
	});
	const { mutate: createAgency, isPending } = useAgencies.create({
		onSuccess: () => {
			toast.success("Agencia creada correctamente");
			setOpen(false);
			form.reset();
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});
	const onSubmit = (data: FormNewAgencySchema) => {
		createAgency(data);
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
								<Input {...field} placeholder="Nombre de la agencia" />
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
								<Input {...field} placeholder="Dirección de la agencia" />
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
								<Input {...field} placeholder="Teléfono de la agencia" type="tel" />
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
								<Input {...field} placeholder="Contacto de la agencia" />
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
								<Input {...field} placeholder="Website de la agencia" />
							</FormControl>
						</FormItem>
					)}
				/>

				<div className="flex lg:flex-row flex-col justify-end gap-2">
					<Button type="submit" disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Guardando...
							</>
						) : (
							"Crear Agencia"
						)}
					</Button>
					<Button variant="outline" onClick={() => setOpen(false)}>
						<X className="w-4 h-4" />
						Cerrar
					</Button>
				</div>
			</form>
		</Form>
	);
};
