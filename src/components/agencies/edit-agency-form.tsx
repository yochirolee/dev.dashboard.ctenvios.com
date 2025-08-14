import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormItem, FormLabel, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAgencies } from "@/hooks/use-agencies";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import type { Agency } from "@/data/types";
import { ImageUploadForm } from "../upload/ImageUploadForm";

const editAgencySchema = z.object({
	id: z.number(),
	name: z.string().min(1, { message: "El nombre de la agencia es requerido" }),
	address: z.string().min(1, { message: "La dirección es requerida" }),
	phone: z.string().min(10, { message: "El teléfono debe tener al menos 10 dígitos" }),
	contact: z.string().min(1),
	email: z.string().email({ message: "El email no es válido" }),
	website: z.string().url({ message: "La URL no es válida" }).optional(),
	forwarder_id: z.number().optional(),
	logo: z.string().url().optional(),
});

type FormEditAgencySchema = z.infer<typeof editAgencySchema>;

export const EditAgencyForm = ({
	setOpen,
	selectedAgency,
	setSelectedAgency,
}: {
	setOpen: (open: boolean) => void;
	selectedAgency: Agency;
	setSelectedAgency: (agency: Agency) => void;
}) => {
	const form = useForm<FormEditAgencySchema>({
		resolver: zodResolver(editAgencySchema),
		defaultValues: {
			id: selectedAgency?.id,
			name: selectedAgency?.name,
			address: selectedAgency?.address,
			phone: selectedAgency?.phone,
			contact: selectedAgency?.contact,
			email: selectedAgency?.email,
			website: selectedAgency?.website,
			logo: selectedAgency?.logo,
		},
	});
	const updateAgencyMutation = useAgencies.update({
		onSuccess: () => {
			toast.success("Agencia actualizada correctamente");
			setSelectedAgency(form.getValues() as unknown as Agency);
			setOpen(false);
			form.reset();
		},
	});
	const onSubmit = (data: FormEditAgencySchema) => {
		console.log(data, "Data in EditAgencyForm");
		updateAgencyMutation.mutate({ id: selectedAgency?.id ?? 0, data: data as unknown as Agency });
		form.reset();
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="flex flex-col justify-center items-center gap-2">
					{selectedAgency?.logo ? (
						<img src={selectedAgency?.logo} alt="Logo" className="w-20 h-20 rounded-full" />
					) : (
						<ImageUploadForm
							onChange={() => {}}
							label="Seleccionar imagen"
							defaultImage={selectedAgency?.logo}
						/>
					)}
				</div>
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

				<div className="flex justify-end gap-2">
					<Button type="submit" disabled={updateAgencyMutation.isPending}>
						{updateAgencyMutation.isPending ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Guardando...
							</>
						) : (
							"Actualizar Agencia"
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
