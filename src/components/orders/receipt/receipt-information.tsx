import { Badge } from "@/components/ui/badge";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";

export function ReceiptInformation() {
	const { selectedReceipt } = useInvoiceStore(
		useShallow((state) => ({
			selectedReceipt: state.selectedReceipt,
		})),
	);
	console.log("Receipt Information", selectedReceipt);
	return (
		<>
			{selectedReceipt && (
				<div className="grid gap-3 mt-2 text-sm p-4 bg-muted rounded-lg">
					<div className="">Informacion del Destinatario </div>
					<dl className="grid gap-3">
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Destinatario</dt>
							<dd>
								{selectedReceipt?.first_name} {selectedReceipt?.second_name}{" "}
								{selectedReceipt?.last_name} {selectedReceipt?.second_last_name}
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Carne de Identidad</dt>
							<dd>{selectedReceipt?.ci}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Email</dt>
							<dd>
								<a href={`mailto:${selectedReceipt?.email}`}>{selectedReceipt?.email}</a>
							</dd>
						</div>

						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Phone</dt>
							<dd>
								<a href={`tel:${selectedReceipt?.phone}`}>{selectedReceipt?.phone}</a>
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Dirección</dt>
							<div className="flex flex-col items-end  gap-2">
								<dd>{selectedReceipt?.address}</dd>

								<Badge variant="outline">
									{selectedReceipt?.province} / {selectedReceipt?.city}
								</Badge>
							</div>
						</div>
					</dl>
				</div>
			)}
		</>
	);
}
