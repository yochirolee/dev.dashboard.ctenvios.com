import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
	first_name: string;
	second_name: string;
	last_name: string;
	second_last_name: string;
	phone: string;
	email: string;
	address: string;
};

export const receiptsColumns: ColumnDef<Payment>[] = [
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
		accessorKey: "full_name",
		header: "Nombre",
		cell: ({ row }) => {
			return (
				<div>
					{row.original.first_name} {row.original.second_name} {row.original.last_name}{" "}
					{row.original.second_last_name}{" "}
				</div>
			);
		},
	},
	{
		accessorKey: "phone",
		header: "Phone",
		cell: ({ row }) => {
			return (
				<div className="flex items-center gap-2 text-muted-foreground">{row.original.phone}</div>
			);
		},
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => {
			return <div>{row.original.email}</div>;
		},
	},

	{
		accessorKey: "address",
		header: "Address",
	},
	{
		accessorKey: "province",
		header: "Province",
	},
	{
		accessorKey: "city",
		header: "City",
	},
];
