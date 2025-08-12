import { format } from "date-fns";
import { Copy, MoreVertical, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvoices } from "@/hooks/use-invoices";
import { type Invoice } from "@/data/types";
import { Badge } from "@/components/ui/badge";

export default function OrderHistory({ invoice }: { invoice: Invoice }) {
	const { data: history } = useInvoices.getHistory(Number(invoice.id));
	return (
		<Card className="overflow-hidden col-span-1 xl:col-span-3">
			<CardHeader className="flex flex-row items-start bg-muted/50">
				<div className="grid gap-0.5">
					<CardTitle className="group flex items-center gap-2 text-lg">
						Order {invoice.id}
						<Button
							size="icon"
							variant="outline"
							className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<Copy className="h-3 w-3" />
							<span className="sr-only">Copy Order ID</span>
						</Button>
					</CardTitle>
					<CardDescription>
						Date: {format(new Date(invoice?.created_at || ""), "dd/MM/yyyy HH:mm a")}
					</CardDescription>
				</div>
				<div className="ml-auto flex items-center gap-1">
					<Button size="sm" variant="outline" className="h-8 gap-1">
						<Truck className="h-3.5 w-3.5" />
						<span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">Track Order</span>
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="icon" variant="outline" className="h-8 w-8">
								<MoreVertical className="h-3.5 w-3.5" />
								<span className="sr-only">More</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Edit</DropdownMenuItem>
							<DropdownMenuItem>Export</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Trash</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className="p-2 text-sm">
				{history?.map((item: any, index: number) => (
					<dl className="grid gap-3 my-2  pb-2 bg-muted/50 px-2 py-3 rounded-md" key={index}>
						<div className="flex items-center gap-2 justify-between">
							<div className="flex  gap-4 items-center">
								<Badge variant="secondary">{item.type}</Badge>
								<dd className="text-xs">{item.description}</dd>
							</div>
							<time className="  text-right text-xs text-muted-foreground">
								{format(new Date(item.date), "dd/MM/yyyy HH:mm a")}
							</time>
						</div>
					</dl>
				))}
			</CardContent>
		</Card>
	);
}
