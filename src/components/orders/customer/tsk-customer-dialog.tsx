import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TskCustomerForm } from "./tsk-customer.form";

export const TskCustomerDialog = () => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Add Customer</Button>
			</DialogTrigger>
			<DialogContent>
				<TskCustomerForm />
			</DialogContent>
		</Dialog>
	);
};
