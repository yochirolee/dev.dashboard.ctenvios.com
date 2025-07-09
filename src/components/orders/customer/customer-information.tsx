import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function CustomerInformation() {
	const { selectedCustomer, setSelectedCustomer, setSelectedReceipt } = useInvoiceStore(
		useShallow((state) => ({
			selectedCustomer: state.selectedCustomer,
			setSelectedCustomer: state.setSelectedCustomer,
			setSelectedReceipt: state.setSelectedReceipt,
		})),
	);

	return (
		<>
			{selectedCustomer && (
				<div className="grid gap-3 mt-2 text-sm p-4 bg-muted rounded-lg">
					<div className="flex items-center justify-between">
						<div className="">Datos del cliente</div>
						<Button
							variant="outline"
							onClick={() => {
								setSelectedCustomer(null);
								setSelectedReceipt(null);
							}}
						>
							Cancelar
						</Button>
					</div>
					<Separator orientation="horizontal" />
					<dl className="grid gap-3">
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Nombre</dt>
							<dd>
								{selectedCustomer?.first_name} {selectedCustomer?.middle_name || ""}{" "}
								{selectedCustomer?.last_name} {selectedCustomer?.second_last_name}
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Email</dt>
							<dd>
								<a href={`mailto:${selectedCustomer?.email}`}>{selectedCustomer?.email}</a>
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Movil/Telefono</dt>
							<dd>
								<a href={`tel:${selectedCustomer?.mobile}`}>{selectedCustomer?.mobile}</a>
								<a href={`tel:${selectedCustomer?.phone}`}>{selectedCustomer?.phone}</a>
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Identificación</dt>
							<dd>
								<a href={`tel:${selectedCustomer?.identity_document}`}>
									{selectedCustomer?.identity_document}
								</a>
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Dirección</dt>
							<dd>{selectedCustomer?.address}</dd>
						</div>
					</dl>
				</div>
			)}
		</>
	);
}
