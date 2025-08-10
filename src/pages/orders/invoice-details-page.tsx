import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetInvoiceById } from "@/hooks/use-invoices";
import {
	MapPin,
	Phone,
	User,
	Trash2,
	Pencil,
	PrinterIcon,
	MoreVertical,
	Plane,
	Ship,
	ChevronLeft,
	Edit,
	CheckCircle2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import OrderHistory from "@/components/orders/order/order-history";
import { Separator } from "@/components/ui/separator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentForm } from "@/components/orders/payments/payment-form";

const baseUrl = import.meta.env.VITE_API_URL;

export default function InvoiceDetailsPage() {
	const { invoiceId } = useParams();
	const navigate = useNavigate();
	const { data, isLoading } = useGetInvoiceById(Number(invoiceId));
	const invoice = data?.rows[0];

	console.log(invoice, "invoice");

	const total = parseFloat(
		invoice?.items.reduce(
			(acc: number, item: any) =>
				acc +
				(item?.rate / 100) * item?.weight +
				item?.customs_fee +
				item?.delivery_fee +
				item?.insurance_fee,
			0,
		),
	);
	console.log(total, "total");

	console.log(invoice);

	if (isLoading) return <div>Loading...</div>;
	return (
		<div className="space-y-6  ">
			<div className="grid grid-cols-10 gap-4">
				<div className="p-4 col-span-7 rounded-lg shadow-lg print:shadow-none bg-card print:bg-white print:py-0 print:text-gray-500">
					<div className="flex justify-between items-center print:hidden">
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2">
								<ChevronLeft size={20} className="cursor-pointer" onClick={() => navigate(-1)} />

								<Separator orientation="vertical" className="min-h-6 mx-2" />
								<div>
									<div className="flex items-center gap-2">
										{invoice?.service.service_type === "MARITIME" ? (
											<Ship size={30} />
										) : (
											<Plane size={30} />
										)}
										<span className="text-sm">{invoice?.service?.provider?.name}</span>
										<Badge
											variant={invoice?.status === "pending" ? "default" : "outline"}
											className="print:hidden"
										>
											{invoice?.status}
										</Badge>
									</div>

									<div className="flex  gap-2">
										<span className="text-sm text-muted-foreground">Facturado por:</span>
										<span className="text-sm"> {invoice?.user?.name}</span>
									</div>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-end gap-2">
							<Link target="_blank" to={`${baseUrl}/invoices/${invoiceId}/pdf`}>
								<Button className="print:hidden bg-blue-600 hover:bg-blue-700 text-white">
									<PrinterIcon className=" h-4 w-4" />
									Print Invoice
								</Button>
							</Link>
							<Link target="_blank" to={`${baseUrl}/invoices/${invoiceId}/labels`}>
								<Button className="print:hidden bg-blue-600 hover:bg-blue-700 text-white">
									<PrinterIcon className=" h-4 w-4" />
									Print Labels
								</Button>
							</Link>

							<Separator orientation="vertical" className="min-h-6 ml-2" />
							<div className="flex items-center ">
								<Link to={`/orders/${invoiceId}/edit`}>
									<Button variant="ghost" className="print:hidden">
										<Edit />
									</Button>
								</Link>
								<Button
									variant="ghost"
									className="print:hidden group hover:bg-red-500 hover:text-white"
								>
									<Trash2 className="group-hover:text-red-400" />
								</Button>
							</div>
						</div>
					</div>

					<Separator className="my-4 print:hidden" />
					<div className="flex  justify-between mt-4 items-start mb-8">
						<div className="flex items-center gap-4">
							{invoice?.agency?.logo ? (
								<img
									src={invoice?.agency?.logo}
									alt={invoice?.agency?.name}
									className="w-20 h-20  p-2 object-center object-scale-down rounded-full  border"
								/>
							) : (
								<div className=" bg-muted min-h-20 min-w-20 object-cover rounded-full border"></div>
							)}

							<div>
								<h1 className="text-xl  font-bold "> {invoice?.agency?.name}</h1>
								<p className="text-sm text-muted-foreground">Address: {invoice?.agency?.address}</p>
								<p className="text-sm text-muted-foreground">Phone: {invoice?.agency?.phone}</p>
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
					<div className="grid grid-cols-2 items-start justify-between gap-20 mb-8">
						<div>
							<ul className="grid gap-3  ">
								<li className="flex items-center gap-2 justify-start">
									<span className="text-muted-foreground">
										<User size={16} />
									</span>
									<span>
										{invoice?.customer?.first_name} {invoice?.customer?.middle_name}{" "}
										{invoice?.customer?.last_name} {invoice?.customer?.second_last_name}
									</span>
								</li>
								<li className="flex items-center gap-2 justify-start">
									<span className="text-muted-foreground">
										<Phone size={16} />
									</span>
									<span>{invoice?.customer?.mobile}</span>
								</li>
								<li className="flex items-center gap-2 justify-start">
									<span className="text-muted-foreground">
										<MapPin size={16} />
									</span>
									<span>{invoice?.customer?.address}</span>
								</li>
							</ul>
						</div>
						<div>
							<ul className="grid gap-3  ">
								<li className="flex items-center gap-2 justify-start">
									<span className="text-muted-foreground">
										<User size={16} />
									</span>
									<span>
										{invoice?.receiver?.first_name} {invoice?.receiver?.middle_name}{" "}
										{invoice?.receiver?.last_name} {invoice?.receiver?.second_last_name}
									</span>
								</li>
								<li className="flex items-center gap-2 justify-start">
									<span className="text-muted-foreground">
										<Phone size={16} />
									</span>
									<span>{invoice?.receiver?.phone || invoice?.receiver?.mobile}</span>
								</li>
								<li className="flex items-center gap-2 justify-start">
									<span className="text-muted-foreground">
										<MapPin size={16} />
									</span>
									<span>{invoice?.receiver?.address}</span>
								</li>
							</ul>
						</div>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-20 text-muted-foreground">HBL</TableHead>
								<TableHead className="w-full text-muted-foreground">Descripción</TableHead>
								<TableHead className="text-right w-14 text-muted-foreground">Seguro</TableHead>
								<TableHead className="text-right w-14 text-muted-foreground">Delivery</TableHead>
								<TableHead className="text-right w-14 text-muted-foreground">Arancel</TableHead>
								<TableHead className="text-right w-14 text-muted-foreground">Precio</TableHead>
								<TableHead className="text-right w-14 text-muted-foreground">Peso</TableHead>
								<TableHead className="text-right w-14 text-muted-foreground">Subtotal</TableHead>
								<TableHead className="text-right w-14 text-muted-foreground"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{invoice?.items.map((item: any, index: number) => (
								<TableRow key={index}>
									<TableCell className="">{item?.hbl}</TableCell>
									<TableCell className="">{item?.description}</TableCell>
									<TableCell className="text-right">
										${parseFloat(item?.insurance_fee).toFixed(2)}
									</TableCell>
									<TableCell className="text-right">
										${parseFloat(item?.delivery_fee).toFixed(2)}
									</TableCell>
									<TableCell className="text-right">
										${parseFloat(item?.customs_fee).toFixed(2)}
									</TableCell>
									<TableCell className="text-right">${(item?.rate / 100).toFixed(2)}</TableCell>
									<TableCell className="text-right">{item?.weight.toFixed(2)}</TableCell>
									<TableCell className="text-right">
										$
										{(
											(item?.rate / 100) * item?.weight +
											item?.customs_fee +
											item?.delivery_fee +
											item?.insurance_fee
										).toFixed(2)}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger>
												<MoreVertical size={16} className="cursor-pointer" />
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem className="cursor-pointer">
													<PrinterIcon size={16} />
													Imprimir
												</DropdownMenuItem>
												<DropdownMenuItem className="cursor-pointer">
													<Pencil size={16} />
													Editar
												</DropdownMenuItem>
												<DropdownMenuItem className="cursor-pointer">
													<Trash2 size={16} />
													Eliminar
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<div className="relative">
						<div className="absolute p-4 inset-0 flex items-center justify-center pointer-events-none">
							<span className="text-[90px] rounded-2xl p-4 bg-green-500/10 border font-extrabold text-green-500 opacity-10 rotate-[-30deg]">
								{invoice?.payment_status }
							</span>
						</div>

						<div className="mt-8 flex justify-end pr-4">
							<ul className="grid gap-3 w-1/6 ">
								<li className="flex items-center justify-between">
									<span className="text-muted-foreground">Subtotal</span>
									<span>${total.toFixed(2)}</span>
								</li>
								<li className="flex items-center justify-between">
									<span className="text-muted-foreground">Shipping</span>
									<span>${invoice?.shipping_fee?.toFixed(2) ?? 0.0}</span>
								</li>
								<li className="flex items-center justify-between">
									<span className="text-muted-foreground">Tax</span>
									<span>${invoice?.tax?.toFixed(2) ?? 0.0}</span>
								</li>
								<li className="flex items-center justify-between">
									<span className="text-muted-foreground">Fee</span>
									<span>${invoice?.fee?.toFixed(2) ?? 0.0}</span>
								</li>

								<li className="flex items-center justify-between font-semibold">
									<span className="text-muted-foreground">Total</span>
									<span>${(invoice?.total_amount / 100).toFixed(2)} </span>
								</li>
								<li className="flex items-center justify-between">
									<span className="text-muted-foreground">Paid</span>
									<span>${(invoice?.paid_amount / 100).toFixed(2) ?? 0.0}</span>
								</li>
								<li className="flex items-center justify-between">
									<span className="text-muted-foreground">Balance</span>
									<span>
										${((invoice?.total_amount - invoice?.paid_amount) / 100).toFixed(2) ?? 0.0}
									</span>
								</li>
							</ul>
						</div>
					</div>
					<Separator className="my-4 print:hidden" />
					<div className="print:hidden mx-auto w-1/6">
						{invoice?.payment_status === "PENDING" ||
						invoice?.payment_status === "PARTIALLY_PAID" ? (
							<PaymentForm invoice={invoice} />
						) : null}
					</div>

					<div className="mt-24 text-center text-gray-500 text-sm">
						<p>{invoice?.agency?.website}</p>
						<p>Thank you for your business!</p>
						<p>Payment is due within 30 days. Please process this invoice within that time.</p>
					</div>
				</div>
				<div className="col-span-3 print:hidden">
					<OrderHistory invoice={invoice} />
				</div>
			</div>
		</div>
	);
}
