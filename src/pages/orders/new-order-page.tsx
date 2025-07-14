import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerCombobox } from "@/components/orders/customer/customer-combobox";
import { ServiceSelector } from "@/components/orders/service-selector";
import { RecipientCombobox } from "@/components/orders/receipt/recipient-combobox";
import { CustomerInformation } from "@/components/orders/customer/customer-information";
import { ReceiptInformation } from "@/components/orders/receipt/receipt-information";
import { ReceiptFormDialog } from "@/components/orders/receipt/receipt-form-dialog";
import { CustomerFormDialog } from "@/components/orders/customer/customer-form-dialog";
import { TestFieldArray } from "@/components/orders/test-field-array";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useEffect } from "react";

export function NewOrderPage() {
	const { setSelectedCustomer, setSelectedRate, setSelectedService, setSelectedReceipt } =
		useInvoiceStore();
	useEffect(() => {
		setSelectedCustomer(null);
		setSelectedRate(null);
		setSelectedService(null);
		setSelectedReceipt(null as any);
	}, []);
	return (
		<div className="space-y-4 ">
			<div className="flex flex-col">
				<h3 className=" font-bold">Crear Orden</h3>
				<p className="text-sm text-gray-500 ">Orden de Envio, Destinatario, Servicio</p>
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


