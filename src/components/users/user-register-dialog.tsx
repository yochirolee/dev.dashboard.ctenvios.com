import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { UserRegisterForm } from "./user-register-form";

export function UserRegisterDialog() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<UserPlus className="w-4 h-4" />
					<span className="hidden md:block">Crear usuario</span>
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Crear usuario</DialogTitle>
					<DialogDescription>Crea un nuevo usuario para la plataforma</DialogDescription>
				</DialogHeader>
				<UserRegisterForm />
			</DialogContent>
		</Dialog>
	);
}
