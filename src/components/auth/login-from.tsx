import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { authClient } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const useLoginMutation = () => {
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			authClient.signIn.email(
				{ email, password },
				{
					onSuccess: () => {
						navigate("/");
					},
					onError: () => {
						navigate("/login");
					},
				},
			),
	});

	return mutation;
};

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const { mutate: login, isPending } = useLoginMutation();

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
													<Input {...field} />
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
													<Input {...field} type="password" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<Button
									type="submit"
									className="w-full inline-flex items-center justify-center"
									disabled={isPending}
								>
									{isPending && <Loader2 className="w-5 h-5  animate-spin" />}
									<p>Login</p>
								</Button>
								<Separator className="my-4" />
							</div>
							<div className="mt-4 text-center text-sm">
								Don&apos;t have an account?{" "}
								<Link to="/register" className="underline underline-offset-4">
									Sign up
								</Link>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
