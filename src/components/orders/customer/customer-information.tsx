import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";

export function CustomerInformation() {
	const { selectedCustomer, setSelectedCustomer } = useInvoiceStore(
		useShallow((state) => ({
			selectedCustomer: state.selectedCustomer,
			setSelectedCustomer: state.setSelectedCustomer,
		})),
	);
	console.log("selectedCustomer", selectedCustomer);
	return (
		<>
			{selectedCustomer && (
				<div className="grid gap-3 mt-2 text-sm p-4 bg-muted rounded-lg">
					<div className="flex justify-between">
						<div className="">Customer Information</div>
						<div className="flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<EllipsisVertical />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem>Editar</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											setSelectedCustomer(null);
										}}
									>
										Cancelar
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<dl className="grid gap-3">
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Customer</dt>
							<dd>
								{selectedCustomer?.first_name} {selectedCustomer?.second_name}{" "}
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
							<dt className="text-muted-foreground">Phone</dt>
							<dd>
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
