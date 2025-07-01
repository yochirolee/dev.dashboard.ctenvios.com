import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormItem, FormLabel, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { Loader2, X } from "lucide-react";
import { useRates } from "@/hooks/use-rates";
import type { Rate } from "@/data/types";
import { toast } from "sonner";

const agenciesRatesSchema = z
	.object({
		rate_id: z.number(),
		agency_id: z.number(),
		agency_rate: z.number().min(0, { message: "El precio de la agencia debe ser mayor a 0" }),
		public_rate: z.number().min(0, { message: "El precio público debe ser mayor a 0" }),
	})
	.refine((data) => data.public_rate >= data.agency_rate, {
		message: "El precio público debe ser mayor o igual al precio de la agencia",
		path: ["public_rate"],
	});

type AgenciesRatesSchema = z.infer<typeof agenciesRatesSchema>;

export const AgenciesRatesForm = ({
	rate,
	setOpen,
}: {
	rate: any;
	setOpen: (open: boolean) => void;
}) => {
	const form = useForm<AgenciesRatesSchema>({
		resolver: zodResolver(agenciesRatesSchema),
		defaultValues: {
			rate_id: rate.id,
			agency_id: rate.agency_id,
			agency_rate: rate.agency_rate,
			public_rate: rate.public_rate,
		},
	});
	const { mutate: updateRate, isPending } = useRates.update();
	const onSubmit = (data: AgenciesRatesSchema) => {
		updateRate({ id: rate.id, data: data as unknown as Rate });
		toast.success("Tarifa actualizada correctamente");
		form.reset();
		setOpen(false);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="agency_rate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Precio Agencia</FormLabel>
							<FormControl>
								<Input
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
								Guardando...
							</>
						) : (
							"Guardar"
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
