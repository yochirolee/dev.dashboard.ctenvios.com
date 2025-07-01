import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

const useLoginMutation = () => {
	return useMutation({
		mutationFn: async ({ email, password }: { email: string; password: string }) => {
			const result = await authClient.signIn.email({ email, password });
			if (result.error) {
				throw new Error(result.error.message || "Login failed");
			}
			return result;
		},
	});
};

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const { mutate: login, isPending, isError } = useLoginMutation();
	const { data: session } = authClient.useSession();
	const navigate = useNavigate();

	// Redirect if already logged in
	useEffect(() => {
		if (session?.user) {
			navigate("/", { replace: true });
		}
	}, [session, navigate]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = async (values: z.infer<typeof formSchema>) => {
		login(values);
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>Enter your email below to login to your account</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)}>
							<div className="flex flex-col gap-6">
								<div className="grid gap-2">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input {...field} type="email" placeholder="Enter your email" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid gap-2">
									<FormField
										control={form.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<div className="flex items-center justify-between">
													<FormLabel>Password</FormLabel>
													<Link
														className="text-sm underline font-light underline-offset-4 hover:underline"
														to="/forgot-password"
													>
														Forgot your password?
													</Link>
												</div>
												<FormControl>
													<Input {...field} type="password" placeholder="Enter your password" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<Separator className="my-2" />
								<Button
									type="submit"
									className="w-full  inline-flex items-center justify-center gap-2"
									disabled={isPending}
								>
									{isPending && <Loader2 className="w-4 h-4 animate-spin" />}
									<span>{isPending ? "Logging in..." : "Login"}</span>
								</Button>
							</div>
							{isError && (
								<div className="mt-4 text-center text-sm">
									<Separator className="my-4" />
									<p className="text-red-500">Invalid email or password</p>
								</div>
							)}
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
