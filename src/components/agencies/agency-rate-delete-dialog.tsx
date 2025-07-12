import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRates } from "@/hooks/use-rates";
import { Loader2 } from "lucide-react";

type AgencyRateDeleteDialogProps = {
	open: boolean;
	setOpen: (open: boolean) => void;
	rateId: number;
};

export function AgencyRateDeleteDialog({ open, setOpen, rateId }: AgencyRateDeleteDialogProps) {
	const { mutate: deleteRate, isPending, error } = useRates.delete();

	console.log(error, "error");

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Esta seguro que desea eliminar esta tarifa?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción no puede ser deshecha. Esta tarifa será eliminada permanentemente.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={() => deleteRate(rateId)} disabled={isPending}>
						{isPending ? (
							<>
								<Loader2 className="animate-spin" /> Deleting
							</>
						) : (
							"Eliminar"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
