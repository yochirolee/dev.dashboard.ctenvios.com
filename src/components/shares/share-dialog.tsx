import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogHeader,
	DialogTrigger,
	DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";

export const ShareDialog = ({
	children,
	title,
	description,
	action,
	open,
	setOpen,
	expanded,
}: {
	children: React.ReactNode;
	title: string;
	description: string;
	action: string;
	open: boolean;
	setOpen: (open: boolean) => void;
	expanded?: boolean;
}) => {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<PlusCircle className="w-4 h-4" />
					<span className={`${expanded ? "block" : "hidden"} lg:block`}>{action}</span>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
};
