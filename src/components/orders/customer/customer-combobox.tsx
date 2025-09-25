import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn, formatFullName } from "@/lib/utils";
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
import { useCustomers } from "@/hooks/use-customers";
import type { Customer } from "@/data/types";

import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";

export const CustomerCombobox = React.memo(function CustomerCombobox() {
	const [open, setOpen] = React.useState(false);
	const [searchQuery, setSearchQuery] = React.useState("");
	const { data, isLoading } = useCustomers.search(searchQuery, 0, 50);

	const { selectedCustomer, setSelectedCustomer } = useInvoiceStore(
		useShallow((state) => ({
			selectedCustomer: state.selectedCustomer,
			setSelectedCustomer: state.setSelectedCustomer,
		})),
	);
	const customers = data?.rows;

	// Memoize the customer selection handler

	// Memoize the search input handler
	const handleSearchChange = React.useCallback((value: string) => {
		setSearchQuery(value);
	}, []);

	// Memoize the popover close handler
	const handlePopoverClose = React.useCallback(() => {
		setSearchQuery("");
		setOpen(false);
	}, []);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="flex-1 justify-between"
				>
					{selectedCustomer?.id
						? [
								selectedCustomer.first_name,
								selectedCustomer.middle_name,
								selectedCustomer.last_name,
								selectedCustomer.second_last_name,
						  ]
								.filter(Boolean)
								.join(" ") +
						  " - " +
						  selectedCustomer.mobile
						: "Seleccionar cliente..."}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
				<Command shouldFilter={false} className="w-full">
					<CommandInput
						placeholder="Buscar cliente..."
						onValueChange={handleSearchChange}
						className="h-9"
					/>
					<CommandList>
						{isLoading ? (
							<div className="flex p-2 items-center justify-center h-full">
								<Loader2 className="animate-spin" />
							</div>
						) : (
							<CommandEmpty>No se encontraron clientes.</CommandEmpty>
						)}
						<CommandGroup>
							{customers?.map((customer: Customer) => (
								<CommandItem
									key={customer?.id}
									value={customer?.id}
									onSelect={() => {
										setSelectedCustomer(customer);
										handlePopoverClose();
									}}
								>
									{formatFullName(
										customer?.first_name,
										customer?.middle_name,
										customer?.last_name,
										customer?.second_last_name,
									)	 +
										" - " +
										(customer?.mobile || customer?.phone)}
									<Check
										className={cn(
											"ml-auto",
											customer?.id === selectedCustomer?.id ? "opacity-100" : "opacity-0",
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
});
