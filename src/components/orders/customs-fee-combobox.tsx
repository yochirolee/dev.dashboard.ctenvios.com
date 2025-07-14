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
import { FormField } from "../ui/form";
import { useCustoms } from "@/hooks/use-customs";
import type { Customs } from "@/data/types";
import { Skeleton } from "../ui/skeleton";
import { useFormContext, type UseFormReturn } from "react-hook-form";

const CustomsFeeCombobox = React.memo(function CustomsFeeCombobox({
	index,
	form,
}: {
	index: number;
	form?: UseFormReturn<any>;
}) {
	const [open, setOpen] = React.useState(false);
	const { data, isLoading } = useCustoms.get(0, 100);

	// Use form prop if provided, otherwise use form context
	const formContext = form || useFormContext();
	const { control, setValue } = formContext;

	return (
		<FormField
			control={control}
			name={`items.${index}.customs`}
			render={({ field }) => (
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							id={`customs-fee-combobox-${index}`}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							aria-controls={`customs-fee-combobox-${index}`}
							className={cn("w-[200px] justify-between", !field.value && "text-muted-foreground")}
						>
							{isLoading ? (
								<Skeleton className="w-full h-4" />
							) : data?.rows?.find((custom: Customs) => custom.name === field.value?.name)?.name ? (
								field.value.name.length > 20 ? (
									`${field.value.name.substring(0, 20)}...`
								) : (
									field.value.name
								)
							) : (
								"Seleccionar Arancel"
							)}
							<ChevronsUpDown className="opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0">
						<Command>
							<CommandInput placeholder="Buscar Arancel..." />
							<CommandList>
								<CommandEmpty>No se encontraron Aranceles.</CommandEmpty>
								<CommandGroup>
									{data?.rows?.map((custom: Customs) => (
										<CommandItem
											key={custom?.id}
											value={custom?.name}
											onSelect={() => {
												field.onChange(custom);
												setValue(`items.${index}.customs_rate_id`, custom.id);
												setOpen(false);
											}}
										>
											{custom.name}
											<Check
												className={cn(
													"ml-auto",
													field?.value?.name === custom?.name ? "opacity-100" : "opacity-0",
												)}
											/>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			)}
		/>
	);
});

export default CustomsFeeCombobox;
