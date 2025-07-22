import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useReceipts } from "@/hooks/use-receipts";
import type { Receipt } from "@/data/types";
import { useDebounce } from "use-debounce";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";

export function RecipientCombobox() {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

	const { selectedReceipt, selectedCustomer, setSelectedReceipt } = useInvoiceStore(
		useShallow((state) => ({
			selectedReceipt: state.selectedReceipt,
			selectedCustomer: state.selectedCustomer,
			setSelectedReceipt: state.setSelectedReceipt,
		})),
	);

	const { data, isLoading, isError } = useReceipts.get(
		selectedCustomer?.id,
		debouncedSearchQuery,
		0,
		100,
	);

	if (isError) {
		return <div>Error loading receipts</div>;
	}

	const receipts = data?.rows;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="flex-1  justify-between"
				>
					{selectedReceipt?.id
						? selectedReceipt.first_name +
						  " " +
						  selectedReceipt.last_name +
						  " " +
						  selectedReceipt.second_last_name +
						  " - " +
						  selectedReceipt.mobile
						: "Seleccionar cliente..."}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
				<Command shouldFilter={false} className="w-full">
					<CommandInput
						placeholder="Buscar cliente..."
						className="h-9"
						onValueChange={setSearchQuery}
					/>
					<CommandList>
						{isLoading ? (
							<div className="flex p-2 items-center justify-center h-full">
								<Loader2 className="animate-spin" />
							</div>
						) : (
							<CommandEmpty>No se encontraron destinatarios.</CommandEmpty>
						)}
						<CommandGroup>
							{receipts?.map((receipt: Receipt) => (
								<CommandItem
									key={receipt?.id}
									value={receipt?.id?.toString() || ""}
									onSelect={() => {
										setSelectedReceipt(receipt);
										setSearchQuery("");
										setOpen(false);
									}}
								>
									{receipt?.first_name +
										" " +
										receipt?.last_name +
										" " +
										receipt?.second_last_name +
										" - " +
										(receipt?.phone || receipt?.mobile)}
									<Check
										className={cn(
											"ml-auto",
											selectedReceipt?.id === receipt?.id ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
