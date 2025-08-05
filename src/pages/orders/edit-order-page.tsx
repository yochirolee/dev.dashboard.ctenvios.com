import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerCombobox } from "@/components/orders/customer/customer-combobox";
import { ServiceSelector } from "@/components/orders/service-selector";
import { ReceiverCombobox } from "@/components/orders/receiver/receiver-combobox";
import { CustomerInformation } from "@/components/orders/customer/customer-information";
import { ReceiverInformation } from "@/components/orders/receiver/receiver-information";
import { ReceiverFormDialog } from "@/components/orders/receiver/receiver-form-dialog";
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
	const { setSelectedCustomer, setSelectedRate, setSelectedService, setSelectedReceiver } =
		useInvoiceStore();

	useEffect(() => {
		setSelectedCustomer(invoice?.customer);
		setSelectedService(invoice?.service);
		setSelectedRate(invoice?.service?.rate);
		setSelectedReceiver(invoice?.receiver);
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
							<ReceiverCombobox />
							<ReceiverFormDialog />
						</div>
						<ReceiverInformation />
					</CardContent>
				</Card>
			</div>

			<ServiceSelector />
			<TestFieldArray />
		</div>
	);
}
