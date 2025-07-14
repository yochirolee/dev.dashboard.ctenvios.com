import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormItem, FormLabel, FormField } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useServices } from "@/hooks/use-services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { Provider } from "@/data/types";

const formNewServiceSchema = z.object({
	name: z.string().min(1, { message: "El nombre del servicio es requerido" }),
	description: z.string().min(1, { message: "La descripción del servicio es requerida" }),
	service_type: z.enum(["MARITIME", "AIR"]),
	provider_id: z.number().min(1, { message: "El proveedor es requerido" }),
	forwarder_id: z.number().min(1, { message: "El forwarder es requerido" }),
	is_active: z.boolean(),
});

type FormNewServiceSchema = z.infer<typeof formNewServiceSchema>;

export const NewServiceForm = ({
	setOpen,
	provider,
}: {
	setOpen: (open: boolean) => void;
	provider: Provider;
}) => {
	const form = useForm<FormNewServiceSchema>({
		resolver: zodResolver(formNewServiceSchema),
		defaultValues: {
			name: "",
			description: "",
			service_type: "MARITIME",
			provider_id: provider.id,
			forwarder_id: 1,
			is_active: true,
		},
	});
	const { mutate: createService, isPending } = useServices.create({
		onSuccess: () => {
			form.reset();
			toast.success("Servicio creado correctamente");
			setOpen(false);
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});
	const onSubmit = (data: FormNewServiceSchema) => {
		createService(data);
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
								<Input {...field} placeholder="Nombre del Servicio" />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descripción</FormLabel>
							<FormControl>
								<Input {...field} placeholder="Descripción del servicio" />
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="service_type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tipo de servicio</FormLabel>
							<FormControl>
								<Select {...field} onValueChange={field.onChange} defaultValue={field.value}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Selecciona un tipo de servicio" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="MARITIME">Marítimo</SelectItem>
										<SelectItem value="AIR">Aéreo</SelectItem>
									</SelectContent>
								</Select>
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
						"Crear Servicio"
					)}
				</Button>
			</form>
		</Form>
	);
};
