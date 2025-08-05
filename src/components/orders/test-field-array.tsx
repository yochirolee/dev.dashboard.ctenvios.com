import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import { Table, TableRow, TableHeader, TableCaption, TableHead, TableBody } from "../ui/table";
import { CardContent, CardHeader, CardTitle, Card } from "../ui/card";
import { Button } from "../ui/button";
import { Trash, PackagePlus, Loader2 } from "lucide-react";
import ItemRow from "./item-row";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { invoiceSchema } from "@/data/types";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { Input } from "../ui/input";
import { useAppStore } from "@/stores/app-store";
import { Separator } from "../ui/separator";

type FormValues = z.infer<typeof invoiceSchema>;

export function TestFieldArray() {
	const session = useAppStore((state) => state.session);
	const [items_count, setItemsCount] = useState(1);
	const navigate = useNavigate();

	const {
		selectedRate,
		selectedCustomer,
		selectedReceiver,
		setSelectedCustomer,
		setSelectedReceiver,
		setSelectedService,
	} = useInvoiceStore(
		useShallow((state) => ({
			selectedRate: state.selectedRate,
			selectedCustomer: state.selectedCustomer,
			selectedReceiver: state.selectedReceiver,
			setSelectedCustomer: state.setSelectedCustomer,
			setSelectedReceiver: state.setSelectedReceiver,
			setSelectedService: state.setSelectedService,
		})),
	);

	const form = useForm<FormValues>({
		resolver: zodResolver(invoiceSchema) as any,
		defaultValues: {
			customer_id: selectedCustomer?.id || 0,
			receiver_id: selectedReceiver?.id || 0,
			agency_id: session?.user?.agency_id || 0,
			user_id: session?.user?.id || "",
			service_id: selectedRate?.service_id || 0,
			total_amount: 0,
			total_weight: 0,
			items: [
				{
					description: "",
					weight: undefined,
					customs_fee: 0.0,
					delivery_fee: 0.0,
					insurance_fee: 0.0,
					rate: selectedRate?.public_rate || 0,
					subtotal: 0,
				},
			],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	useEffect(() => {
		setItemsCount(fields.length);
	}, [fields]);

	const handleAddItem = () => {
		// Evita borrar todo si ya hay exactamente los items requeridos
		if (fields.length !== items_count) {
			handleRemoveAll();

			const itemsToAdd = Array.from({ length: items_count - 1 }, () => ({
				description: "",
				weight: undefined,
				customs_fee: 0,
				delivery_fee: 0,
				insurance_fee: 0,
				rate: selectedRate?.public_rate || 0,
				subtotal: 0,
			}));

			itemsToAdd.forEach((item) => append(item));
		}
	};
	const handleRemoveAll = () => {
		// remove all items BUT the first one NOT THE FIRST ONE
		fields.forEach((field, index) => {
			if (index > 0) {
				remove(Number(field.id));
			}
		});
		setItemsCount(1);
	};

	const { mutate: createInvoice, isPending: isCreatingInvoice } = useCreateInvoice({
		onSuccess: (data) => {
			form.reset();
			setSelectedCustomer(null);
			setSelectedReceiver(null);
			setSelectedService(null);
			toast.success("Orden creada correctamente");
			navigate(`/orders/${data.id}`);
		},
	});

	const handleSubmit = (data: FormValues) => {
		console.log(data, "data in handleSubmit");
		data.service_id = selectedRate?.service_id || 0;
		data.agency_id = session?.user?.agency_id || 0;
		data.user_id = session?.user?.id || "";
		data.customer_id = selectedCustomer?.id || 0;
		data.receiver_id = selectedReceiver?.id || 0;
		data.items.forEach((item) => {
			item.rate = selectedRate?.public_rate || 0;
		});
		console.log(data, "form Data");
		createInvoice(data);
	};
	console.log(form.formState.errors, "errors");

	return (
		<Card>
			<form onSubmit={form.handleSubmit(handleSubmit as any)}>
				<CardHeader>
					<CardTitle className="flex justify-between items-center">
						<h3>Items in Order</h3>
						<div className="flex space-x-2 justify-end items-center">
							<Input
								className="w-18"
								type="number"
								min={1}
								value={items_count === 0 ? "" : items_count}
								onChange={(e) => {
									const val = e.target.value;
									if (val === "") {
										setItemsCount(0); // Temporarily allow 0 to avoid breaking input
									} else {
										const num = Number(val);
										if (!isNaN(num) && num >= 1) {
											setItemsCount(num);
										}
									}
								}}
							/>

							<Button onClick={handleAddItem} variant="ghost" type="button">
								<PackagePlus />
								<span className="hidden xl:block">Add Item</span>
							</Button>
							<Button onClick={handleRemoveAll} variant="ghost" type="button">
								<Trash />
								<span className="hidden xl:block">Delete All</span>
							</Button>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableCaption>A list of your recent invoices.</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[50px]">No.</TableHead>
								<TableHead>Categoria</TableHead>
								<TableHead>Description</TableHead>
								<TableHead className="text-right w-20">Arancel</TableHead>
								<TableHead className="text-right w-20">Peso</TableHead>
								<TableHead className="text-right w-20">Price</TableHead>
								<TableHead className="text-right w-20">Subtotal</TableHead>
								<TableHead className="w-10"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{fields.map((_, index) => (
								<ItemRow
									key={index}
									index={index}
									form={form}
									remove={remove}
									selectedRate={selectedRate}
								/>
							))}
						</TableBody>
					</Table>
				</CardContent>
				<div className="mt-8 flex justify-end pr-6">
					<ul className="grid gap-3 w-1/6 ">
						<li className="flex items-center justify-between">
							<span className="text-muted-foreground">Subtotal</span>
							<span>${form.getValues("total_amount")}</span>
						</li>

						<li className="flex items-center justify-between">
							<span className="text-muted-foreground">Discount</span>
							<span>${0.0}</span>
						</li>
						<li className="flex items-center justify-between font-semibold">
							<span className="text-muted-foreground">Total</span>
							<span>${useWatch({ control: form.control, name: "total_amount" })}</span>
						</li>
					</ul>
				</div>

				<div className="flex justify-end m-10">
					<Separator />
				</div>
				<div className="flex justify-end m-10">
					<Button className="w-1/2 mt-4 mx-auto" type="submit" disabled={isCreatingInvoice}>
						{isCreatingInvoice ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" /> Facturando...
							</>
						) : (
							"Facturar"
						)}
					</Button>
				</div>

				<div className="flex justify-end m-10">
					{Object.keys(form.formState.errors).length > 0 && (
						<p className="text-red-500">{JSON.stringify(form.formState)}</p>
					)}
				</div>
			</form>
		</Card>
	);
}
