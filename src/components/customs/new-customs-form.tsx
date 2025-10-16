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
	DialogFooter,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useCustoms } from "@/hooks/use-customs";
import type { Customs } from "@/data/types";
import { customsRatesSchema } from "@/data/types";
import { centsToDollars, dollarsToCents } from "@/lib/cents-utils";
import { useEffect } from "react";

type FormData = z.input<typeof customsRatesSchema>;

export function NewCustomsForm({
	customsRate,
	setCustomsRate,
	open,
	setOpen,
}: {
	customsRate: Customs | undefined;
	setCustomsRate: (customsRate: Customs | undefined) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const form = useForm<FormData>({
		resolver: zodResolver(customsRatesSchema),
		defaultValues: {
			name: "",
			description: "",
			chapter: "",
			country_id: 1,
			fee_type: "UNIT",
			fee_in_cents: undefined,
			min_weight: 0,
			max_weight: 0,
			max_quantity: 0,
		},
	});

	useEffect(() => {
		if (customsRate) {
			form.reset({
				name: customsRate?.name,
				description: customsRate?.description,
				chapter: customsRate?.chapter,
				country_id: customsRate?.country_id,
				fee_type: customsRate?.fee_type,
				fee_in_cents: centsToDollars(customsRate?.fee_in_cents ?? 0),
				min_weight: customsRate?.min_weight ?? 0,
				max_weight: customsRate?.max_weight ?? 0,
				max_quantity: customsRate?.max_quantity ?? 0,
			});
		} else {
			form.reset({
				name: "",
				description: "",
				chapter: "",
				country_id: 1,
				fee_type: "UNIT",
				fee_in_cents: undefined,
				min_weight: 0,
				max_weight: 0,
				max_quantity: 0,
			});
		}
	}, [customsRate, open]);

	console.log(customsRate, "customsRate");

	const createCustomsMutation = useCustoms.create();
	const updateCustomsMutation = useCustoms.update();
	const onSubmit = async (data: FormData) => {
		const feeInCents = dollarsToCents(data.fee_in_cents ?? 0);
		console.log(feeInCents);
		if (customsRate) {
			updateCustomsMutation.mutate(
				{ id: customsRate?.id, data: { ...data, fee_in_cents: feeInCents } } as {
					id: number;
					data: Customs;
				},
				{
					onSuccess: () => {
						setOpen(false);
						setCustomsRate(undefined);
						form.reset();
					},
				},
			);
		} else {
			createCustomsMutation.mutate({ ...data, fee_in_cents: feeInCents } as Customs, {
				onSuccess: () => {
					setCustomsRate(undefined);
					setOpen(false);
					form.reset();
				},
			});
		}
	};

	console.log(form.formState.errors, "errors");

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
											<SelectTrigger className="w-full">
												<SelectValue
													placeholder="Selecciona un tipo de fee"
													aria-placeholder="Selecciona un tipo de fee"
												/>
											</SelectTrigger>
											<SelectContent className="w-full">
												<SelectGroup>
													{["UNIT", "WEIGHT", "VALUE"].map((feeType) => (
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

						<FormItem className="flex flex-col">
							<div className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="fee_in_cents">Fee</Label>
									<FormControl>
										<Input
											className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
											{...form.register(`fee_in_cents`, {
												valueAsNumber: true,
											})}
											placeholder="0.00"
											type="number"
											min={0.0}
											step={0.01}
											autoComplete="off"
										/>
									</FormControl>
								</div>
								<FormMessage />
							</div>
						</FormItem>

						<FormItem className="flex flex-col">
							<div className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="max_quantity">Cantidad Max Permitida</Label>
									<FormControl>
										<Input
											className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
											{...form.register(`max_quantity`, {
												valueAsNumber: true,
											})}
											placeholder="0"
											type="number"
											min={1}
											step={1}
											autoComplete="off"
										/>
									</FormControl>
								</div>
								<FormMessage />
							</div>
						</FormItem>

						<DialogFooter>
							<div className="flex flex-col gap-2 w-full	">
								<Button
									type="submit"
									className="w-full"
									disabled={createCustomsMutation.isPending || updateCustomsMutation.isPending}
								>
									{createCustomsMutation.isPending || updateCustomsMutation.isPending
										? "Creando..."
										: "Crear"}
								</Button>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={() => setOpen(false)}
								>
									Cancelar
								</Button>
							</div>
							{createCustomsMutation.error && (
								<Alert variant="destructive">{createCustomsMutation.error.message}</Alert>
							)}
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
