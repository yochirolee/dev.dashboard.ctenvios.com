import React, { useMemo, useCallback, useDeferredValue } from "react";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { TableCaption, TableHead, TableHeader } from "@/components/ui/table";
import { TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackagePlus, Trash } from "lucide-react";
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
import { authClient } from "@/lib/auth-client";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

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

const formSchema = z.object({
	agency_id: z.string(),
	user_id: z.string(),
	customer_id: z.string(),
	receipt_id: z.string(),
	total: z.number(),
	currency: z.number(),
	payment_method: z.string(),
	payment_status: z.string(),
	payment_date: z.date(),
	payment_amount: z.number(),
	service_id: z.string(),
	rate: z.number(),
	items: z.array(
		z.object({
			id: z.number(),
			description: z.string().min(1, { message: "Description is required" }),
			weight: z.number().min(0.01, { message: "Weight must be greater than 0.01" }),
			rate: z.number().min(0, { message: "Rate must be greater than 0" }),
			subtotal: z.number().min(0, { message: "Subtotal must be greater than 0" }),
			customs: z.object({
				description: z.string(),
				fee: z.number().min(0, { message: "Fee must be greater than 0" }),
			}),
		}),
	),
});

export function TableItemsInOrder() {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();

	const { customer_id, receipt_id, selectedRate } = useInvoiceStore(
		useShallow((state) => ({
			customer_id: state.selectedCustomer?.id,
			receipt_id: state.selectedReceipt?.id,
			selectedRate: state.selectedRate,
		})),
	);

	const methods = useForm<z.infer<typeof formSchema>>({
		defaultValues: {
			agency_id: session?.user?.agency_id || "",
			user_id: session?.user?.id,
			customer_id: customer_id || "",
			receipt_id: receipt_id || "",
			service_id: selectedRate?.service_id || "",
			rate: selectedRate?.public_rate || 0,
			total: 0,
			currency: 0,
			payment_method: "",
			payment_status: "",
			payment_date: new Date(),
			payment_amount: 0,
			items: [
				{
					id: 1,
					description: "",
					weight: 0,
					rate: 0,
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
		control: methods.control,
		name: "items",
	});
	const deferedFields = useDeferredValue(fields);
	// Memoize handlers to prevent re-creation on every render
	const handleAddItem = () => {
		append({
			id: fields.length + 1,
			description: "",
			weight: 0.0,
			subtotal: 0,
			customs: {
				description: "",
				fee: 0,
			},
		});
	};

	const handleRemoveAllItems = useCallback(() => {
		fields.forEach((field) => {
			remove(field.id);
		});
		deferedFields.forEach((field) => {
			remove(field.id);
		});
	}, [fields, remove]);

	// Watch only the items array for total calculation

	const onSubmit = async (data: any) => {
		console.log("data", data);

		/* const response = await axios.post("http://localhost:3000/api/v1/invoices", data);
		navigate(`/orders/${response.data.id}`); */
		toast.success("Orden creada correctamente");
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)}>
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
								{deferedFields?.map((field, index) => (
									<ItemRow key={field.id} index={index} rate={selectedRate?.public_rate || 0} />
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

const ItemRow = React.memo(function ItemRow({ index, rate }: { index: number; rate: number }) {
	const { control, setValue } = useFormContext();

	// Only watch the specific fields needed for this row
	const itemWeight = useWatch({ control, name: `items.${index}.weight` }) || 0;
	const customsFee = useWatch({ control, name: `items.${index}.customs.fee` }) || 0;
	const customsDescription =
		useWatch({ control, name: `items.${index}.customs.description` }) || "";
	const subtotal = useWatch({ control, name: `items.${index}.subtotal` }) || 0;

	// Memoize subtotal calculation and update form when dependencies change
	useMemo(() => {
		const calculatedSubtotal =
			parseFloat(rate.toString()) * parseFloat(itemWeight.toString()) +
			parseFloat(customsFee || "0");

		// Update the form value when subtotal changes
		setValue(`items.${index}.subtotal`, calculatedSubtotal, { shouldValidate: true });
		setValue(`items.${index}.rate`, rate, { shouldValidate: true });
		setValue(`items.${index}.customs.fee`, customsFee, { shouldValidate: true });
		setValue(`items.${index}.description`, customsDescription, { shouldValidate: true });
	}, [rate, itemWeight, customsFee]);

	// Memoize the remove handler
	const handleRemove = useCallback(() => {
		// Implementation for removing individual item would go here
		console.log(`Remove item at index ${index}`);
	}, [index]);

	return (
		<TableRow>
			<TableCell className="font-medium">{index + 1}</TableCell>
			<TableCell className="w-40">
				<CustomsFeeCombobox index={index} />
			</TableCell>
			<TableCell className="w-full gap-2">
				<FormField
					control={control}
					name={`items.${index}.description` as string}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input {...field} placeholder="Description" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</TableCell>
			<TableCell className="text-right w-20">${parseFloat(customsFee || "0").toFixed(2)}</TableCell>
			<TableCell>
				<FormField
					control={control}
					name={`items.${index}.weight` as string}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									placeholder="0.0"
									type="number"
									step="0.01"
									disabled={!customsFee}
									className="w-20 text-right [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</TableCell>
			<TableCell className="text-right w-20">${rate || 0}</TableCell>
			<TableCell className="text-right w-20">${control.wat || 0}</TableCell>
			<TableCell className="w-10 justify-end">
				<Button
					className="hover:text-red-500/60"
					variant="ghost"
					onClick={handleRemove}
					type="button"
				>
					<Trash />
				</Button>
			</TableCell>
		</TableRow>
	);
});

const TotalSection = React.memo(function TotalSection() {
	const { control, watch } = useFormContext();
	const items = useWatch({ control, name: "items" });

	const total = parseFloat(
		items.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0).toFixed(2),
	);
	const totalWeight = parseFloat(
		items
			.reduce((sum: number, item: any) => sum + (parseFloat(item?.weight || "0") || 0), 0)
			.toFixed(2),
	);

	return (
		<div className="flex flex-col gap-4 items-end">
			<div className="flex gap-4 items-center">
				<span className="">Total Weight:</span>
				<span className=" ">{totalWeight} Lbs</span>
			</div>
			<div className="flex gap-4 items-center">
				<span className="font-medium">Total:</span>
				<span className="font-bold text-lg">${total}</span>
			</div>
			<div className="flex gap-4 items-center">
				<pre className="text-xs">{JSON.stringify(watch(), null, 2)}</pre>
			</div>
		</div>
	);
});
