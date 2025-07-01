import { cn } from "@/lib/utils";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

const registerSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		email: z.string().email(),
		password: z.string().min(8),
		confirmPassword: z.string().min(8),
		
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords must match",
		path: ["confirmPassword"],
	});

const useRegisterMutation = () => {
	const { mutate: register, isPending } = useMutation({
		mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) => {
			return authClient.signUp.email({ name, email, password });
		},
	});

	return { register, isPending };
};

export function ConfigRegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const { register, handleSubmit } = useForm<z.infer<typeof registerSchema>>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = (data: any) => {
		console.log(data);
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Register</CardTitle>
					<CardDescription>Enter your email below to register to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									type="text"
									placeholder="John Doe"
									required
									{...register("name")}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									required
									{...register("email")}
								/>
							</div>
							<div className="grid gap-2">
								<div className="flex items-center">
									<Label htmlFor="password">Password</Label>
								</div>
								<Input id="password" type="password" required {...register("password")} />
							</div>
							<div className="grid gap-2">
								<div className="flex items-center">
									<Label htmlFor="confirmPassword">Repeat Password</Label>
								</div>
								<Input
									id="confirmPassword"
									type="password"
									required
									{...register("confirmPassword")}
								/>
							</div>
							<Button type="submit" className="w-full">
								Register
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
