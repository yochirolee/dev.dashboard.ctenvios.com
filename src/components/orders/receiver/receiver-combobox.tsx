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
import { useReceivers } from "@/hooks/use-receivers";
import type { Receiver } from "@/data/types";
import { useDebounce } from "use-debounce";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";

export function ReceiverCombobox() {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

	const { selectedReceiver, selectedCustomer, setSelectedReceiver } = useInvoiceStore(
		useShallow((state) => ({
			selectedReceiver: state.selectedReceiver,
			selectedCustomer: state.selectedCustomer,
			setSelectedReceiver: state.setSelectedReceiver,
		})),
	);

	const { data, isLoading, isError } = useReceivers.get(
		selectedCustomer?.id,
		debouncedSearchQuery,
		0,
		100,
	);

	if (isError) {
		return <div>Error loading receipts</div>;
	}

	const receivers = data?.rows;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="flex-1  justify-between"
				>
					{selectedReceiver?.id
						? selectedReceiver.first_name +
						  " " +
						  selectedReceiver.last_name +
						  " " +
						  selectedReceiver.second_last_name +
						  " - " +
						  (selectedReceiver.mobile || selectedReceiver.phone)
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
							{receivers?.map((receiver: Receiver) => (
								<CommandItem
									key={receiver?.id}
									value={receiver?.id?.toString() || ""}
									onSelect={() => {
										setSelectedReceiver(receiver);
										setSearchQuery("");
										setOpen(false);
									}}
								>
									{receiver?.first_name +
										" " +
										receiver?.last_name +
										" " +
										receiver?.second_last_name +
										" - " +
										(receiver?.mobile || receiver?.phone)}
									<Check
										className={cn(
											"ml-auto",
											selectedReceiver?.id === receiver?.id ? "opacity-100" : "opacity-0",
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
