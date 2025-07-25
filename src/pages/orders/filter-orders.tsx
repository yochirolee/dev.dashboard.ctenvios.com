import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";
import { DatePickerWithRange } from "@/components/dates/data-range-picker";
import { useState } from "react";

export function FilterOrders() {
	const [date, setDate] = useState<Date | undefined>(undefined);

	return (
		<div>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Button variant="outline">
						<FilterIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>
						<DatePickerWithRange date={date} setDate={setDate} />
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
