import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import {
	Select,
	SelectItem,
	SelectTrigger,
	SelectContent,
	SelectValue,
	SelectGroup,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useCustoms } from "@/hooks/use-customs";
import type { Customs } from "@/data/types";

const CUSTOMS_FEE_TYPES = ["UNIT", "WEIGHT", "VALUE"] as const;

// Create a form-specific schema that matches expected input
const formSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().min(1, "La descripción es requerida"),
	country_id: z.number().min(1, "El país es requerido"),
	chapter: z.string().optional(),
	fee_type: z.enum(["UNIT", "WEIGHT", "VALUE"]),
	fee: z.number().min(0, "El fee es requerido"),
	max_quantity: z.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function NewCustomsForm() {
	const [open, setOpen] = useState(false);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			country_id: 1,
			chapter: "",
			fee_type: "UNIT" as const,
			fee: 0,
			max_quantity: undefined,
		},
	});

	const createCustomsMutation = useCustoms.create();

	const onSubmit = async (data: FormData) => {
		createCustomsMutation.mutate(data as Customs, {
			onSuccess: () => {
				setOpen(false);
				form.reset();
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<PlusCircle className="w-4 h-4" />
					<span className="hidden md:block">Crear Arancel</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Crear Arancel</DialogTitle>
					<DialogDescription>Crea un nuevo Arancel para la plataforma</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<div className="grid gap-4">
										<div className="grid gap-2">
											<Label htmlFor="name">Nombre Completo</Label>
											<FormControl>
												<Input
													{...field}
													id="name"
													placeholder="Nombre del Arancel"
													type="text"
													required
												/>
											</FormControl>
										</div>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<div className="grid gap-4">
										<div className="grid gap-2">
											<Label htmlFor="description">Descripción</Label>
											<FormControl>
												<Input
													{...field}
													id="description"
													placeholder="Descripción del Arancel"
													required
												/>
											</FormControl>
										</div>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<div className="flex flex-col w-full gap-2">
							<Label htmlFor="fee_type">Tipo de Fee</Label>
							<FormField
								control={form.control}
								name="fee_type"
								render={({ field }) => (
									<FormItem>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger>
												<SelectValue
													placeholder="Selecciona un tipo de fee"
													aria-placeholder="Selecciona un tipo de fee"
												/>
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													{CUSTOMS_FEE_TYPES.map((feeType) => (
														<SelectItem key={feeType} value={feeType}>
															{feeType}
														</SelectItem>
													))}
												</SelectGroup>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="fee"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<div className="grid gap-4">
										<div className="grid gap-2">
											<Label htmlFor="fee">Fee</Label>
											<FormControl>
												<Input
													className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
													{...field}
													onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
													placeholder="0.00"
													type="number"
													min={0.01}
													step={0.01}
													autoComplete="off"
												/>
											</FormControl>
										</div>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="max_quantity"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<div className="grid gap-4">
										<div className="grid gap-2">
											<Label htmlFor="max_quantity">Cantidad Max Permitida</Label>
											<FormControl>
												<Input
													{...field}
													id="max_quantity"
													placeholder="Cantidad Maxima"
													type="number"
													required
													onChange={(e) => {
														const value = e.target.value;
														field.onChange(value === "" ? undefined : parseFloat(value));
													}}
													value={field.value || ""}
												/>
											</FormControl>
										</div>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full" disabled={createCustomsMutation.isPending}>
							{createCustomsMutation.isPending ? "Registrando..." : "Registrar"}
						</Button>

						{createCustomsMutation.error && (
							<Alert variant="destructive">{createCustomsMutation.error.message}</Alert>
						)}
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
