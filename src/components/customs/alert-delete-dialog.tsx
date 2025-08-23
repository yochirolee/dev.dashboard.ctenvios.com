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
import type { Customs } from "@/data/types";
import { useCustoms } from "@/hooks/use-customs";
import { toast } from "sonner";

export function AlertDeleteDialog({
	open,
	setOpen,
	customsRate,
	setCustomsRate,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	customsRate: Customs;
	setCustomsRate: (customsRate: Customs | undefined) => void;
}) {
	const deleteCustomsMutation = useCustoms.delete();

	const handleDelete = () => {
		deleteCustomsMutation.mutate(customsRate.id as number);
		toast.success("Registro eliminado correctamente");
		setOpen(false);
		setCustomsRate(undefined);
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Estás seguro de querer eliminar este registro?</AlertDialogTitle>
					<AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete}>
						{deleteCustomsMutation.isPending ? "Eliminando..." : "Eliminar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
