import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormItem, FormLabel, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { Loader2, X } from "lucide-react";
import { useShippingRates } from "@/hooks/use-shipping-rates";
import type { ShippingRate } from "@/data/types";
import { useAppStore } from "@/stores/app-store";

const agenciesRatesSchema = z
	.object({
		name: z.string().min(1, { message: "El nombre es requerido" }),
		rate_id: z.number().optional(),
		agency_id: z.number().optional(),
		agency_rate: z.number().min(0, { message: "El precio de la agencia debe ser mayor a 0" }),
		public_rate: z.number().min(0, { message: "El precio público debe ser mayor a 0" }),
		service_id: z.number().optional(),
	})
	.refine((data) => data.public_rate >= data.agency_rate, {
		message: "El precio público debe ser mayor o igual al precio de la agencia",
		path: ["public_rate"],
	});

type AgenciesRatesSchema = z.infer<typeof agenciesRatesSchema>;

export const AgenciesRatesForm = ({
	rate,
	setOpen,
	mode,
}: {
	rate: any;
	setOpen: (open: boolean) => void;
	mode: "create" | "update";
}) => {
	const form = useForm<AgenciesRatesSchema>({
		resolver: zodResolver(agenciesRatesSchema),

		defaultValues:
			mode === "create"
				? {
						name: "",
						agency_id: rate.agency_id,
						agency_rate: rate.agency_rate,
						public_rate: rate.public_rate,
						service_id: rate.service_id,
				  }
				: {
						name: rate.name,
						rate_id: rate.id,
						agency_id: rate.agency_id,
						agency_rate: rate.agency_rate/100,
						public_rate: rate.public_rate/100,
				  },
	});
	const { mutate: updateRate, isPending: isUpdating } = useShippingRates.update();
	const { mutate: createRate, isPending: isCreating } = useShippingRates.create();
	const isPending = isUpdating || isCreating;
	const onSubmit = (data: AgenciesRatesSchema) => {
		mode === "update"
			? updateRate({ id: rate.id, data: data as unknown as ShippingRate })
			: createRate(data as unknown as ShippingRate);
		form.reset();
		setOpen(false);
	};

	const { session } = useAppStore();

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
								<Input {...field} placeholder="Nombre" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					name="agency_rate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Precio Agencia</FormLabel>
							<FormControl>
								<Input
									disabled={
										session?.user?.role !== "ROOT" && session?.user?.role !== "ADMINISTRATOR"
									}
									type="number"
									{...field}
									onChange={(e) => {
										field.onChange(e);
										form.setValue("agency_rate", parseFloat(e.target.value));
									}}
									placeholder="Precio Agencia"
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
							<FormLabel>Precio Público</FormLabel>
							<FormControl>
								<Input
									type="number"
									{...field}
									onChange={(e) => {
										field.onChange(e);
										form.setValue("public_rate", parseFloat(e.target.value));
									}}
									placeholder="Precio Público"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end gap-2">
					<Button type="submit" disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								{mode === "create" ? "Creando..." : "Actualizando..."}
							</>
						) : mode === "create" ? (
							"Crear"
						) : (
							"Actualizar"
						)}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							form.reset();
							setOpen(false);
						}}
					>
						<X className="w-4 h-4" />
						Cerrar
					</Button>
				</div>
			</form>
		</Form>
	);
};
