import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

const formSchema = z.object({
	search: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
});

export function SearchInvoiceForm({
	setSearchQuery,

	isLoading,
}: {
	setSearchQuery: (value: string) => void;
	isLoading: boolean;
}) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			search: "",
		},
	});

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		setSearchQuery(data.search);
	};
    

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="search"
					render={({ field }) => (
						<FormItem className="flex items-center gap-2">
							<FormLabel className="sr-only">Buscar</FormLabel>
							<FormControl>
								<Input type="search" placeholder="Buscar" {...field} className="w-sm" />
							</FormControl>{" "}
							<Button disabled={isLoading} variant="outline" type="submit">
								{isLoading ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Search className="w-4 h-4" />
					 			)}
							</Button>
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
