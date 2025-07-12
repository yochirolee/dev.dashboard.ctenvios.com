import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerCombobox } from "@/components/orders/customer/customer-combobox";
import { ServiceSelector } from "@/components/orders/service-selector";
import { RecipientCombobox } from "@/components/orders/receipt/recipient-combobox";
import { CustomerInformation } from "@/components/orders/customer/customer-information";
import { ReceiptInformation } from "@/components/orders/receipt/receipt-information";
import { ReceiptFormDialog } from "@/components/orders/receipt/receipt-form-dialog";
import { CustomerFormDialog } from "@/components/orders/customer/customer-form-dialog";
import { TestFieldArray } from "@/components/orders/test-field-array";
import { useParams } from "react-router-dom";
import { useGetInvoiceById } from "@/hooks/use-invoices";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useEffect } from "react";

export function EditOrderPage() {
	const params = useParams();
	const orderId = Number(params.invoiceId);
	console.log(orderId);
	const { data, isLoading } = useGetInvoiceById(orderId);
	const invoice = data?.rows[0];
	const { setSelectedCustomer, setSelectedRate, setSelectedService, setSelectedReceipt } = useInvoiceStore();

	useEffect(() => {
		setSelectedCustomer(invoice?.customer);
		setSelectedService(invoice?.service);
		setSelectedRate(invoice?.service?.rate);
		setSelectedReceipt(invoice?.receipt);
	}, [orderId, data]);

	if (isLoading) return <div>Loading...</div>;
	console.log(invoice);

	return (
		<div className="space-y-4 ">
			<div className="flex flex-col">
				<h3 className=" font-bold">Editar Orden</h3>
				<p className="text-sm text-gray-500 ">Editar la Orden de Envio, Destinatario, Servicio</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Cliente</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col  gap-2">
						<div className="flex flex-col lg:flex-row gap-2">
							<CustomerCombobox />
							<CustomerFormDialog />
						</div>

						<CustomerInformation />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Destinatario</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<div className="flex flex-col lg:flex-row gap-2">
							<RecipientCombobox />
							<ReceiptFormDialog />
						</div>
						<ReceiptInformation />
					</CardContent>
				</Card>
			</div>

			<ServiceSelector />
			<TestFieldArray />
		</div>
	);
}

// Separate component for the preview to avoid re-renders in main component
function InvoicePreview() {
	/* const methods = useFormContext();
	 */
	return (
		<div className="space-y-3">
			<h3 className="font-semibold text-lg border-b border-gray-800 pb-2">API Payload Preview</h3>
			<pre className="bg-gray-950 p-4 rounded-md overflow-x-auto text-xs">
				{/* 	{JSON.stringify(methods.watch(), null, 2)} */}
			</pre>
		</div>
	);
}
