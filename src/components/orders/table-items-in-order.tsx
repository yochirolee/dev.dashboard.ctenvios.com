import React, { useCallback, useEffect } from "react";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { TableCaption, TableHead, TableHeader } from "@/components/ui/table";
import { TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, PackagePlus, ShieldCheckIcon, ShieldXIcon, Trash } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
import CustomsFeeCombobox from "./customs-fee-combobox";

import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import axios from "axios";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const formSchema = z.object({
	agency_id: z.number(),
	user_id: z.string(),
	customer_id: z.number(),
	receipt_id: z.number(),
	weight: z.number(),
	total: z.number(),
	service_id: z.number(),
	rate: z.number(),
	items: z.array(
		z.object({
			id: z.number(),
			description: z.string().min(1, { message: "Description is required" }),
			weight: z.string().min(0.01, { message: "Weight must be greater than 0.01" }),
			rate: z.number().min(0, { message: "Rate must be greater than 0" }),
			subtotal: z.number().min(0, { message: "Subtotal must be greater than 0" }),
			customs: z.object({
				description: z.string().min(1, { message: "Description is required" }),
				fee: z.number().min(0, { message: "Fee must be greater than 0" }),
			}),
		}),
	),
});

const TableHeaderSection = React.memo(function TableHeaderSection({
	itemCount,
	onAddItem,

	onRemoveAll,
}: {
	itemCount: number;
	onAddItem: () => void;
	onRemoveAll: () => void;
}) {
	return (
		<CardHeader>
			<CardTitle className="flex justify-between items-center">
				<h3>Items in Order</h3>
				<div className="flex space-x-2 justify-end items-center">
					<Badge variant="secondary" className="text-center">
						Count: {itemCount}
					</Badge>
					<Button onClick={onAddItem} variant="ghost" type="button">
						<PackagePlus />
						<span className="hidden xl:block">Add Item</span>
					</Button>
					<Button onClick={onRemoveAll} variant="ghost" type="button">
						<Trash />
						<span className="hidden xl:block">Delete All</span>
					</Button>
				</div>
			</CardTitle>
		</CardHeader>
	);
});

export function TableItemsInOrder() {
	const navigate = useNavigate();

	const { customer_id, receipt_id, selectedRate } = useInvoiceStore(
		useShallow((state) => ({
			customer_id: state.selectedCustomer?.id,
			receipt_id: state.selectedReceipt?.id,
			selectedRate: state.selectedRate,
		})),
	);

	console.log("re-render on TableItemsInOrder");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			customer_id: customer_id || 0,
			receipt_id: receipt_id || 0,
			service_id: selectedRate?.service_id || 0,
			rate: selectedRate?.public_rate || 0,
			total: 0,
			weight: 0,
			items: [
				{
					id: 1,
					description: "",
					weight: undefined,

					rate: selectedRate?.public_rate || 0,
					subtotal: 0,
					customs: {
						description: "",
						fee: 0,
					},
				},
			],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "items",
	});

	// Memoize handlers to prevent re-creation on every render
	const handleAddItem = useCallback(() => {
		append({
			id: fields.length + 1,
			description: "",
			weight: "",
			rate: 0,
			subtotal: 0,
			customs: {
				description: "",
				fee: 0,
			},
		});
	}, [append, fields.length]);

	const handleRemoveAllItems = useCallback(() => {
		fields.forEach((_, index) => {
			remove(index);
		});
	}, [fields, remove]);

	const handleRemoveItem = useCallback((id: number) => {
		console.log("id", id);
		remove(id);
	}, []);

	// Watch only the items array for total calculation

	const onSubmit = async (data: any) => {
		data.customer_id = customer_id;
		data.receipt_id = receipt_id;
		data.service_id = selectedRate?.service_id;
		data.rate = selectedRate?.public_rate;

		console.log("data on Submit", data);

		const response = await axios.post("http://localhost:3000/api/v1/invoices", data);
		navigate(`/orders/${response.data.id}`);
		toast.success("Orden creada correctamente");
	};

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Card>
					<TableHeaderSection
						itemCount={fields.length}
						onAddItem={handleAddItem}
						onRemoveAll={handleRemoveAllItems}
					/>
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
									<TableHead className="w-10">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{fields?.map((field, index) => (
									<ItemRow
										key={field.id}
										index={index}
										rate={selectedRate?.public_rate || 0}
										remove={() => handleRemoveItem(field.id)}
									/>
								))}
							</TableBody>
						</Table>
					</CardContent>
					<CardFooter className="flex justify-end border-t border-dashed mt-10 border-muted-foreground/20 py-4">
						<TotalSection />
					</CardFooter>
					<div className="flex justify-center mt-4">
						<Button type="submit">Facturar</Button>
					</div>
				</Card>
			</form>
		</FormProvider>
	);
}

//ITEM ROW
const ItemRow = React.memo(function ItemRow({
	index,
	rate,
	remove,
}: {
	index: number;
	rate: number;
	remove: (index: number) => void;
}) {
	const { control, setValue } = useFormContext();

	// Solo un watch para reducir renders innecesarios
	const item = useWatch({ control, name: `items.${index}` });

	const weight = parseFloat(item?.weight || "0");
	const customsFee = parseFloat(item?.customs?.fee || "0");
	const subtotal = parseFloat(item?.subtotal || "0");

	// Actualiza subtotal solo cuando cambian dependencias reales
	useEffect(() => {
		const calculatedSubtotal = rate * weight + customsFee;
		setValue(`items.${index}.subtotal`, calculatedSubtotal, { shouldValidate: true });
	}, [weight, customsFee, index]);

	return (
		<TableRow>
			<TableCell className="font-medium">{index + 1}</TableCell>

			<TableCell className="w-40">
				<CustomsFeeCombobox index={index} />
			</TableCell>

			<TableCell className="w-full gap-2">
				<FormField
					control={control}
					name={`items.${index}.description`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className="flex relative items-center gap-2">
									<Input {...field} placeholder="Description" />
									<div className="flex gap-2 items-center absolute right-2">
										<ShieldCheckIcon className="w-4 h-4" />
										{item?.customs?.max_quantity && (
											<Badge variant="secondary" className="text-xs text-muted-foreground  right-2">
												{item?.customs?.max_quantity}
											</Badge>
										)}
									</div>
								</div>
							</FormControl>
						</FormItem>
					)}
				/>
			</TableCell>

			<TableCell className="text-right w-20">${customsFee.toFixed(2)}</TableCell>

			<TableCell>
				<FormField
					control={control}
					name={`items.${index}.weight`}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									{...field}
									placeholder="0"
									type="text"
									disabled={!customsFee || !rate}
									className="w-20 text-right [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
			</TableCell>

			<TableCell className="text-right w-20">${rate.toFixed(2)}</TableCell>

			<TableCell className="text-right w-20">${subtotal.toFixed(2)}</TableCell>

			<TableCell className="w-10 justify-end">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="hover:text-red-500/60">
							<MoreVertical />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<ShieldXIcon />
							No Asegurado
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => remove(index)} className="flex items-center gap-2">
							<Trash />
							Eliminar
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
});

//TOTAL SECTION
const TotalSection = React.memo(function TotalSection() {
	const { control, watch, setValue, getValues, formState } = useFormContext();
	const items = useWatch({ control, name: "items" });
	console.log("items", items);

	const total = parseFloat(
		items.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0).toFixed(2),
	);
	const totalWeight = parseFloat(
		items
			.reduce((sum: number, item: any) => sum + (parseFloat(item?.weight || "0") || 0), 0)
			.toFixed(2),
	);

	useEffect(() => {
		setValue("total", total);
		setValue("weight", totalWeight);
	}, [items.length, total, totalWeight]);

	return (
		<div className="flex flex-col gap-4 items-end">
			<div className="flex gap-4 items-center">
				<span className="">Total Weight:</span>
				<span className=" ">{getValues("weight")} Lbs</span>
			</div>
			<div className="flex gap-4 items-center">
				<span className="font-medium">Total:</span>
				<span className="font-bold text-lg">${getValues("total")}</span>
			</div>
			<div className="flex gap-4 items-center">
				<pre className="text-xs">{JSON.stringify(watch(), null, 2)}</pre>
				<pre className="text-xs">{JSON.stringify(formState.errors, null, 2)}</pre>
			</div>
		</div>
	);
});
