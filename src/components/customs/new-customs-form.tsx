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
import { customsSchema } from "@/data/types";

export const description =
	"A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account.";

const FormSchema = customsSchema;

const CUSTOMS_FEE_TYPES = ["UNIT", "WEIGHT", "VALUE"] as const;

type FormValues = z.infer<typeof FormSchema>;

export function NewCustomsForm() {
	const [open, setOpen] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: "",
			description: "",
			country_id: 1,
			chapter: "",
			fee_type: "UNIT",
			fee: 0,
			max_quantity: 0,
		},
	});

	const createCustomsMutation = useCustoms.create();

	const onSubmit = async (data: FormValues) => {
		console.log(data, "data in onSubmit");
		createCustomsMutation.mutate(data, {
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
													{...field}
													id="fee"
													placeholder="Fee del Arancel"
													type="number"
													required
													onChange={(e) => {
														const value = e.target.value;
														field.onChange(value === "" ? 0 : parseFloat(value));
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
														field.onChange(value === "" ? 0 : parseFloat(value));
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
