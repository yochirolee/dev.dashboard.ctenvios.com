            import { z } from "zod";
            import { useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { FormItem, FormField, FormControl, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const invoiceSchema = z.object({
	customer_id: z.string(),
	receipt_id: z.string(),
	agency_id: z.string(),
	service_id: z.string(),
	items: z.array(
		z.object({
			description: z.string(),
			quantity: z.number(),
			price: z.number(),
		}),
	),
	total: z.number(),
	currency: z.number(),
	payment_method: z.string(),
	payment_status: z.string(),
	payment_date: z.date(),
	payment_amount: z.number(),
});
export function NewInvoicePage() {
	const { handleSubmit, formState: {errors}, control} = useForm<z.infer<typeof invoiceSchema>>({
		resolver: zodResolver(invoiceSchema),
		defaultValues: {
			customer_id: "",
		},
	});
    const onSubmit = (data: z.infer<typeof invoiceSchema>) => {
        console.log(data);
    }
	return (
		<div>
			<h1>New Invoice</h1>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormField
					control={control}
					name="customer_id"
					    render={({ field }) => (
                        <div>
								<Label>Customer</Label>
								    <Input {...field} />
                                {errors.customer_id && <p>{errors.customer_id.message}</p>}
                            </div>
					)}
				/>
			</form>
		</div>
	);
}
