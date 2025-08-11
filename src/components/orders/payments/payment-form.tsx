import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, DollarSign, Loader2 } from "lucide-react";
import { usePayInvoice } from "@/hooks/use-invoices";
import { payment_methods } from "@/data/data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { paymentSchema } from "@/data/types";
import { toast } from "sonner";
import { type Invoice } from "@/data/types";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@/components/ui/dialog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const PaymentForm = ({ invoice }: { invoice: Invoice }) => {
	const balance = ((invoice?.total_amount - invoice?.paid_amount) / 100).toFixed(2);
	const form = useForm<z.infer<typeof paymentSchema>>({
		resolver: zodResolver(paymentSchema),
		defaultValues: {
			amount: parseFloat(balance),
			payment_method: payment_methods[0].value,
			payment_reference: undefined,
			notes: undefined,
		},
	});

	const { mutate: createPayment, isPending } = usePayInvoice({
		onSuccess: () => {
			form.reset();

			toast.success("Payment created successfully");
			setOpen(false);
			
		},
		onError: (error: any) => {
			toast.error(error.response.data.message);
		},
	});

	const onSubmit = (data: z.infer<typeof paymentSchema>) => {
		createPayment({ invoice_id: Number(invoice.id), data });
	};

	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="default" className="print:hidden w-full">
					<DollarSign className="w-4 h-4" />
					<span className="hidden md:block">Pagar</span>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Pagar</DialogTitle>
					<DialogDescription>Pagar la factura</DialogDescription>
				</DialogHeader>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card className="@container/card">
						<CardHeader>
							<CardDescription>Total de la factura</CardDescription>
							<CardTitle className="text-2xl font-semibold text-muted-foreground tabular-nums @[250px]/card:text-3xl">
								${invoice?.total_amount / 100}
							</CardTitle>
						</CardHeader>
					</Card>
					<Card className="@container/card">
						<CardHeader>
							<CardDescription>Pendiente de Pago</CardDescription>
							<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
								${balance}
							</CardTitle>
						</CardHeader>
					</Card>
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-8">
						<PaymentMethodCombobox />

						<FormField
							control={form.control}
							name="payment_reference"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Referencia de pago</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Referencia de pago" />
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="Amount"
											type="number"
											min={0}
											max={Number(balance) ?? 0.0}
											step={0.01}
											className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] text-right"
											onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" disabled={isPending}>
							{isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pagar"}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

const PaymentMethodCombobox = () => {
	const form = useFormContext();
	const [open, setOpen] = useState(false);
	return (
		<FormField
			control={form.control}
			name="payment_method"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Método de pago</FormLabel>

					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={open}
								className="w-full justify-between"
							>
								{field.value
									? payment_methods.find((payment_method) => payment_method.value === field.value)
											?.label
									: "Select payment method"}
								<ChevronsUpDown className="opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandInput placeholder="Search payment method..." className="h-9" />
								<CommandList>
									<CommandEmpty>No payment method found.</CommandEmpty>
									<CommandGroup>
										{payment_methods.map((method) => (
											<CommandItem
												key={method.value}
												value={method.value}
												onSelect={(currentValue) => {
													form.setValue(field.name, currentValue);
													setOpen(false);
												}}
											>
												{method.label}
												<Check
													className={cn(
														"ml-auto",
														field.value === method.value ? "opacity-100" : "opacity-0",
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</FormItem>
			)}
		/>
	);
};
