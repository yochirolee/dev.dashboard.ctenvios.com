import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
	CheckCircle2,
	Clock,
	CircleDashed,
	EllipsisVertical,
	FileText,
	Pencil,
	TagIcon,
	Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { queryClient } from "@/lib/query-client";
import api from "@/api/api";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Invoice = {
	id: number;
	agency: {
		id: number;
		name: string;
	};
	customer: {
		id: number;
		first_name: string;
		middle_name: string;
		last_name: string;
		second_last_name: string;
		mobile: string;
	};
	receiver: {
		id: number;
		first_name: string;
		middle_name: string;
		last_name: string;
		second_last_name: string;
		mobile: string;
	};
	service: {
		id: number;
		name: string;
	};
	payment_status: string;
	status: string;
	created_at: string;
	updated_at: string;
	total_amount: number;
	paid_amount: number;
	user: {
		id: number;
		name: string;
	};
	_count: {
		items: number;
	};
};

const baseUrl = import.meta.env.VITE_API_URL;

export const orderColumns: ColumnDef<Invoice>[] = [
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
		size: 50,
	},

	{
		accessorKey: "id",
		header: "Factura",
		cell: ({ row }) => {
			return (
				<Link
					className="flex items-center gap-2"
					target="_blank"
					to={`${baseUrl}/invoices/${row.original?.id}/pdf`}
				>
					<FileText size={16} className="shrink-0" />
					<span className="font-medium">{row.original?.id}</span>
				</Link>
			);
		},
		size: 100,
	},
	{
		accessorKey: "_count",
		header: "Labels",
		cell: ({ row }) => {
			return (
				<Badge variant="secondary" className="flex items-center gap-2 w-fit">
					<Link
						className="flex items-center gap-2"
						target="_blank"
						to={`${baseUrl}/invoices/${row.original?.id}/labels`}
					>
						<span>{row?.original?._count.items}</span>
						<TagIcon size={16} />
					</Link>
				</Badge>
			);
		},
		size: 80,
	},

	{
		accessorKey: "agency.name",
		header: "Agencia",
		cell: ({ row }) => {
			return (
				<div className="max-w-[150px] truncate" title={row.original?.agency?.name}>
					{row.original?.agency?.name}
				</div>
			);
		},
		size: 150,
	},

	{
		accessorKey: "service",
		header: "Servicio",
		cell: ({ row }) => {
			return (
				<Badge
					variant="secondary"
					className="max-w-[120px] truncate"
					title={row.original?.service?.name}
				>
					{row.original?.service?.name}
				</Badge>
			);
		},
		size: 120,
	},

	{
		accessorKey: "customer",
		header: "Envia",
		cell: ({ row }) => {
			const customer = row.original?.customer;
			const fullName = `${customer?.first_name || ""} ${customer?.middle_name || ""} ${
				customer?.last_name || ""
			} ${customer?.second_last_name || ""}`.trim();

			return (
				<div className="flex items-center gap-2 min-w-0">
					<Avatar className="w-8 h-8 shrink-0">
						<AvatarFallback>
							{customer?.first_name?.charAt(0) || ""}
							{customer?.last_name?.charAt(0) || ""}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0">
						<div className="truncate text-sm font-medium" title={fullName}>
							{fullName}
						</div>
						<div className="text-xs text-muted-foreground truncate" title={customer?.mobile}>
							{customer?.mobile}
						</div>
					</div>
				</div>
			);
		},
		size: 200,
	},
	{
		accessorKey: "receiver",
		header: "Recibe",
		cell: ({ row }) => {
			const receiver = row.original?.receiver;
			const fullName = `${receiver?.first_name || ""} ${receiver?.middle_name || ""} ${
				receiver?.last_name || ""
			} ${receiver?.second_last_name || ""}`.trim();

			return (
				<div className="flex items-center gap-2 min-w-0">
					<Avatar className="w-8 h-8 shrink-0">
						<AvatarFallback>
							{receiver?.first_name?.charAt(0) || ""}
							{receiver?.last_name?.charAt(0) || ""}
						</AvatarFallback>
					</Avatar>
					<div className="min-w-0 ">
						<div className="truncate text-sm font-medium" title={fullName}>
							{fullName}
						</div>
						<div className="text-xs text-muted-foreground truncate" title={receiver?.mobile}>
							{receiver?.mobile}
						</div>
					</div>
				</div>
			);
		},
		size: 200,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			return (
				<Badge variant="secondary" className="whitespace-nowrap">
					{row.original?.status}
				</Badge>
			);
		},
		size: 100,
	},
	{
		accessorKey: "created_at",
		header: "Fecha",
		cell: ({ row }) => {
			return (
				<div className="text-sm whitespace-nowrap flex flex-col ">
					<span>{format(new Date(row.original?.created_at), "dd/MM/yyyy HH:mm a")}</span>
					<span className="text-xs text-muted-foreground">{row.original?.user?.name}</span>
				</div>
			);
		},
		size: 150,
	},

	{
		accessorKey: "payment_status",
		header: "Payment",
		cell: ({ row }) => {
			return paymentStatus(row.original?.payment_status);
		},
		size: 100,
	},

	{
		accessorKey: "subtotal",
		header: "Total",
		cell: ({ row }) => {
			return (
				<div className="text-right font-medium whitespace-nowrap flex flex-col items-end">
					${(row.original?.total_amount / 100).toFixed(2)}
					<span className="text-xs text-muted-foreground">
						{(row.original?.total_amount - row.original?.paid_amount) / 100 !== 0 &&
							` ${((row.original?.total_amount - row.original?.paid_amount) / 100).toFixed(2)}`}
					</span>
				</div>
			);
		},
		size: 100,
	},
	{
		header: "Actions",
		cell: ({ row }) => {
			return (
				<div className="flex justify-center">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<EllipsisVertical className="w-4 h-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<Link to={`/orders/${row.original.id}`}>
								<DropdownMenuItem>
									<FileText className="w-4 h-4 mr-2" />
									Details
								</DropdownMenuItem>
							</Link>
							<DropdownMenuSeparator />
							<Link to={`/orders/${row.original.id}/edit`}>
								<DropdownMenuItem>
									<Pencil className="w-4 h-4 mr-2" />
									Editar
								</DropdownMenuItem>
							</Link>
							<DropdownMenuItem className="text-destructive">
								<Trash className="w-4 h-4 mr-2" />
								Eliminar
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
		size: 60,
		enableSorting: false,
	},
];

const paymentStatus = (payment_status: string) => {
	switch (payment_status) {
		case "PAID":
			return (
				<Badge className="bg-green-500/10 text-green-500/80">
					<CheckCircle2 className="w-4 h-4 mr-1" />
					Paid
				</Badge>
			);
		case "PARTIALLY_PAID":
			return (
				<Badge className="bg-yellow-500/10 text-yellow-500/80">
					<CircleDashed className="w-4 h-4 mr-1 " />
					Partial
				</Badge>
			);
		default:
			return (
				<Badge className="bg-red-500/10 text-red-500/80">
					<Clock className="w-4 h-4 mr-1" />
					Pending
				</Badge>
			);
	}
};
