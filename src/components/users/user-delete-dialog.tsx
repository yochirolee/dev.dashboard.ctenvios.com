//a modal to delete a user

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useDeleteUser } from "@/hooks/use-users";

export const UserDeleteDialog = ({
	isOpen,
	setIsOpen,
	id,
}: {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	id: string | null;
}) => {
	const deleteUser = useDeleteUser();
	const handleDeleteUser = () => {
		if (!id) return;
		deleteUser.mutate(id);
		setIsOpen(false);
	};

	const handleCancel = () => {
		setIsOpen(false);
	};
	if (!id) return null;

	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your account and remove your
						data from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDeleteUser}>
						{deleteUser.isPending ? "Deleting..." : "Continue"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
