import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@/components/ui/separator";

export function ReceiptInformation() {
	const { selectedReceipt, setSelectedReceipt } = useInvoiceStore(
		useShallow((state) => ({
			selectedReceipt: state.selectedReceipt,
			setSelectedReceipt: state.setSelectedReceipt,
		})),
	);
	return (
		<>
			{selectedReceipt && (
				<div className="grid gap-3 mt-2 text-sm p-4 bg-muted rounded-lg">
					<div className="flex items-center justify-between">
						<div className="">Datos del Destinatario</div>
						<Button
							variant="outline"
							onClick={() => {
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
								{selectedReceipt?.first_name} {selectedReceipt?.middle_name}
								{selectedReceipt?.last_name} {selectedReceipt?.second_last_name}
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Carne de Identidad</dt>
							<dd>{selectedReceipt?.ci}</dd>
						</div>

						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Movil/Telefono</dt>
							<dd>
								<a href={`tel:${selectedReceipt?.phone}`}>{selectedReceipt?.phone}</a>
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Dirección</dt>
							<div className="flex flex-col items-end  gap-2">
								<dd className="text-sm text-right">{selectedReceipt?.address}</dd>

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
