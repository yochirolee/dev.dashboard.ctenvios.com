import { useGetInvoices, useSearchInvoices } from "@/hooks/use-invoices";
import { FilePlus2, Printer } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { orderColumns } from "@/components/orders/order/order-columns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchInvoiceForm } from "@/components/orders/order/search-invoice-form";
import type { PaginationState } from "@tanstack/react-table";
export default function InvoicesPage() {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 40 });
	const { data: invoices, isLoading } = useGetInvoices(pagination);

	return (
		<div className="space-y-4 ">
			<div className="flex items-center justify-between">
				<div className="flex flex-col">
					<h3 className=" font-bold">Facturas</h3>
					<p className="text-sm text-gray-500 "> Listado de Facturas</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={() => navigate("/orders/new")} variant="outline">
						<FilePlus2 className="w-4 h-4" />
						<span className="hidden md:block">Nueva Orden</span>
					</Button>
					<Button disabled={true} onClick={() => navigate("/orders/new")} variant="outline">
						<Printer className="w-4 h-4" />
						<span className="hidden md:block">Imprimir</span>
						<Badge variant="outline" className=" md:ml-2 border-none">
							0
						</Badge>
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<SearchInvoiceForm setSearchQuery={setSearchQuery} isLoading={isLoading} />
				</div>
				<DataTable columns={orderColumns} data={invoices || []} />
			</div>
		</div>
	);
}
