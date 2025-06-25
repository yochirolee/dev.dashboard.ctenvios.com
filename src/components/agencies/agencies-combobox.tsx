import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAgencies } from "@/hooks/use-agencies";
import { FormField } from "../ui/form";
import { FormItem } from "../ui/form";
import { FormLabel } from "../ui/form";
import { FormControl } from "../ui/form";
import { FormMessage } from "../ui/form";
import { type Control } from "react-hook-form";

export const AgenciesCombobox = ({ control }: { control: Control<any> }) => {
	console.log(control, "control");
	const [open, setOpen] = useState(false);

	const { data: agencies = [], isLoading, error } = useAgencies.get();

	if (error) {
		return <div>Error loading agencies</div>;
	}

	return (
		<FormField
			control={control}
			name="agency_id"
			render={({ field }) => (
				<FormItem>
					<FormLabel>Agency</FormLabel>
					<FormControl>
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className="w-[300px]  justify-between"
								>
									{field.value ? (
										agencies.find((agency: any) => agency.id === field.value)?.name +
										" - " +
										field.value
									) : isLoading ? (
										<Skeleton className="h-4 w-full" />
									) : (
										"Agencias..."
									)}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-0">
								<Command className="w-[300px]">
									<CommandInput placeholder="Search Agency..." />
									<CommandList>
										<CommandEmpty>No agencies found.</CommandEmpty>
										<CommandGroup>
											{agencies.map((agency: any) => (
												<CommandItem
													key={agency.id}
													value={agency.id}
													onSelect={() => {
														field.onChange(agency.id);
														setOpen(false);
													}}
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4",
															field.value === agency.id ? "opacity-100" : "opacity-0",
														)}
													/>
													{agency.name + " - " + agency.id}
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
