import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePickerWithRange({
	date,
	setDate,
}: {
	date: Date | undefined;
	setDate: (date: Date | undefined) => void;
}) {
	const [open, setOpen] = React.useState(false);

	return (
		<div className="flex flex-col gap-3">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline" className=" justify-between font-normal">
						<CalendarIcon className="w-4 h-4" />
						{date ? date.toLocaleDateString() : ""}
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-auto overflow-hidden p-0" align="start">
					<Calendar
						mode="single"
						disabled={(date) => date > new Date()}
						selected={date}
						captionLayout="dropdown"
						onSelect={(date) => {
							setDate(date!);
							setOpen(false);
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
