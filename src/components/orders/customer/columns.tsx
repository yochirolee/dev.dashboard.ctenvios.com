import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Customer = {
	id: string;
	first_name: string;
	second_name: string;
	last_name: string;
	second_last_name: string;
	identity_document: string;
	email: string;
	phone: string;
	address: string;
};

export const columns: ColumnDef<Customer>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "first_name",
		header: "Nombre",
		cell: ({ row }) => {
			return (
				<div>
					{row.original?.first_name} {row.original?.second_name} {row.original?.last_name}{" "}
					{row.original?.second_last_name}
				</div>
			);
		},
	},
	{
		accessorKey: "phone",
		header: "Telefono",
	},
	{
		accessorKey: "identity_document",
		header: "Identificacion",
	},
	{
		accessorKey: "email",
		header: "Email",
	},

	{
		accessorKey: "address",
		header: "Address",
	},
];
