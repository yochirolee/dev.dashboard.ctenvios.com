import { useFieldArray, useFormContext } from "react-hook-form";
import { DataTable } from "../ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, Trash } from "lucide-react";
import { TableItemsInOrder } from "./table-items-in-order";

const columns = [
	{
		header: "ID",
		accessorKey: "id",
	},
	{
		header: "Description",
		accessorKey: "description",
	},
	{
		header: "Price",
		accessorKey: "price",
	},
	{
		header: "Quantity",
		accessorKey: "quantity",
	},
	{
		header: "Weight",
		accessorKey: "weight",
	},
	{
		header: "Subtotal",
		accessorKey: "subtotal",
	},
	{
		header: "Customs Fee",
		accessorKey: "customs_fee",
	},
];

export function TableOrders() {
	const { fields, append } = useFieldArray({
		name: "items",
	});

	const handleAddItem = () => {
		append({
			id: fields.length + 1,
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Items in Order</CardTitle>
				<CardDescription>Items in Order</CardDescription>
				<CardContent>
					<div className="flex justify-between">
						<div className="flex items-center gap-2">
							<span className="font-medium">Total:</span>
							<Button onClick={() => handleAddItem} variant="ghost">
								<Plus />
								<span className="hidden xl:block">Add Item</span>
							</Button>
							<Button variant="ghost">
								<Trash />
								<span className="hidden xl:block">Delete All</span>
							</Button>
						</div>
					</div>
				</CardContent>
			</CardHeader>
			<CardContent>
				<TableItemsInOrder />
			</CardContent>
		</Card>
	);
}
