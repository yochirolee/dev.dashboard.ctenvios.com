import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { useFormContext } from "react-hook-form";
import type { ProductRate } from "@/data/types";
import { useAppStore } from "@/stores/app-store";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useShallow } from "zustand/react/shallow";
import { useProducts } from "@/hooks/use-products";

const FixedRatesCombobox = React.memo(function FixedRatesCombobox({
	form,
	index,
}: {
	form: any;
	index: number;
}) {
	const [open, setOpen] = React.useState(false);

	const formContext = form || useFormContext();
	const { setValue } = formContext;
	const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
	const session = useAppStore((state) => state.session);
	const { selectedService } = useInvoiceStore(
		useShallow((state) => ({
			selectedService: state.selectedService,
		})),
	);

	const { data: products } = useProducts.getRates(
		session?.user?.agency_id || 0,
		selectedService?.id || 0,
	);

	const handleUpdateRate = (product: ProductRate) => {
		setSelectedProduct(product);
		setValue(`items.${index}.rate_in_cents`, product.rate_in_cents);
		setValue(`items.${index}.rate_id`, product.rate_id);
		setValue(`items.${index}.description`, product.name);
		setValue(`items.${index}.rate_type`, product.rate_type);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={`fixed-rates-combobox`}
					variant="outline"
					role="combobox"
					aria-expanded={open}
					aria-controls={`fixed-rates-combobox`}
					className={cn(
						"w-[200px] justify-between",
						!selectedProduct?.name && "text-muted-foreground",
					)}
				>
					{products?.find((product: ProductRate) => product.name === selectedProduct?.name)?.name
						? selectedProduct.name.length > 20
							? `${selectedProduct.name.substring(0, 20)}...`
							: selectedProduct.name
						: "Seleccionar Producto"}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Buscar Producto..." />
					<CommandList>
						<CommandEmpty>No se encontraron Productos.</CommandEmpty>
						<CommandGroup>
							{products?.map((product: ProductRate) => (
								<CommandItem
									key={product?.id}
									value={product?.name}
									onSelect={() => {
										handleUpdateRate(product);
									}}
								>
									{product.name}
									<Check
										className={cn(
											"ml-auto",
											selectedProduct?.name === product.name ? "opacity-100" : "opacity-0",
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

export default FixedRatesCombobox;
