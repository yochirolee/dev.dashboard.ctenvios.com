import { Link, useParams } from "react-router-dom";
import { useGetInvoiceById } from "@/hooks/use-invoices";
import { Building2, MapPin, Phone, Printer, User, FileText } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function InvoiceDetailsPage() {
	const params = useParams();
	const invoiceId = params.invoiceId as string;

	const { data: invoice, isLoading } = useGetInvoiceById(invoiceId);

	const handlePrint = () => {
		window.print();
	};

	if (isLoading) return <div>Loading...</div>;
	return (
		<div className="space-y-10 xl:min-w-[1024px] 2xl:min-w-[1280px] mx-auto print:w-full">
			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={handlePrint} className="print:hidden">
					<Printer className="mr-2 h-4 w-4" /> Print Invoice
				</Button>
				<Link to={`/orders/${invoiceId}/labels`}>
					<Button variant="outline" className="print:hidden">
						<Printer className="mr-2 h-4 w-4" /> Print Labels HTML
					</Button>
				</Link>
				<Link target="_blank" to={`http://localhost:3000/api/v1/invoices/${invoiceId}/pdf`}>
					<Button className="print:hidden bg-blue-600 hover:bg-blue-700 text-white">
						<FileText className="mr-2 h-4 w-4" />
						Print PDF
					</Button>
				</Link>
				<Link target="_blank" to={`http://localhost:3000/api/v1/invoices/${invoiceId}/labels`}>
					<Button className="print:hidden bg-blue-600 hover:bg-blue-700 text-white">
						<FileText className="mr-2 h-4 w-4" />
						Print Labels PDF
					</Button>
				</Link>
			</div>
			<div className="p-4 rounded-lg shadow-lg print:shadow-none bg-card print:bg-white print:py-0 print:text-gray-500">
				<div className="flex  justify-between mt-4 items-start mb-8">
					<div className="flex items-center gap-4">
						{invoice?.agency?.logo ? (
							<img src={invoice?.agency?.logo} alt="logo" className="w-10 h-10 rounded-full" />
						) : (
							<Building2 className="text-gray-500 w-14 h-14 rounded-full border" />
						)}

						<div>
							<h1 className="text-xl  font-bold "> {invoice?.agency?.name}</h1>
							<p className="text-sm text-gray-300">Address: {invoice?.agency?.address}</p>
							<p className="text-sm text-gray-300">Phone: {invoice?.agency?.phone}</p>
						</div>
					</div>

					<div>
						<h1 className="text-xl text-end font-bold ">Invoice {invoice?.id}</h1>
						<p className="text-lg text-end">Items: {invoice?.items.length}</p>
						<time className="text-sm">
							Fecha: {format(new Date(invoice?.created_at), "dd/MM/yyyy HH:mm a")}
						</time>
					</div>
				</div>
				<div className="grid grid-cols-2 items-start justify-between gap-4 mb-8">
					<div>
						<h2 className=" mb-2">Envia:</h2>
						<p className="flex items-center gap-2">
							<User className="text-gray-500" size={16} />
							{invoice?.customer?.first_name +
								" " +
								invoice?.customer?.last_name +
								" " +
								invoice?.customer?.second_last_name}
						</p>
						<p className="flex items-center gap-2">
							<Phone className="text-gray-500" size={16} />
							{invoice?.customer?.phone}
						</p>
					</div>
					<div>
						<h2 className=" mb-2">Recibe:</h2>
						<p className="flex items-center gap-2">
							<User className="text-gray-500" size={16} />
							{invoice?.receipt?.first_name +
								" " +
								invoice?.receipt?.last_name +
								" " +
								invoice?.receipt?.second_last_name}
						</p>
						<p className="flex items-center gap-2">
							<Phone className="text-gray-500" size={16} />
							{invoice?.receipt?.phone}
						</p>
						<p className="flex items-center gap-2">
							<MapPin className="text-gray-500" size={16} />
							{invoice?.receipt?.address}
						</p>
					</div>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>HBL</TableHead>
							<TableHead>Descripción</TableHead>
							<TableHead className="text-right">Precio</TableHead>
							<TableHead className="text-right">Peso</TableHead>
							<TableHead className="text-right">Subtotal</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invoice?.items.map((item: any, index: number) => (
							<TableRow key={index}>
								<TableCell className="">{item?.hbl}</TableCell>
								<TableCell className="">{item?.description}</TableCell>
								<TableCell className="text-right">${parseFloat(item?.rate).toFixed(2)}</TableCell>
								<TableCell className="text-right">{item?.weight}</TableCell>
								<TableCell className="text-right">
									${parseFloat((item?.rate * item?.weight).toFixed(2))}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<div className="mt-8 text-right">
					<p className="text-lg font-semibold">Total: ${invoice?.total?.toFixed(2)}</p>
				</div>
				<div className="mt-8 text-gray-500 text-sm">
					<p>Thank you for your business!</p>
					<p>Payment is due within 30 days. Please process this invoice within that time.</p>
				</div>
			</div>
		</div>
	);
}
