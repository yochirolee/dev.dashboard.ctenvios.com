import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/auth-context";
import { Alert } from "@/components/ui/alert";

export const description =
	"A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account.";

const FormSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

type FormValues = z.infer<typeof FormSchema>;

export function UserLoginForm() {
	const form = useForm<FormValues>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const { login, isLoggingIn, loginError } = useAuth();

	const onSubmit = (data: z.infer<typeof FormSchema>) => {
		login(data.email, data.password);
	};

	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Login</CardTitle>
				<CardDescription>Enter your email below to login to your account</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<div className="grid gap-4">
										<div className="grid gap-2">
											<Label htmlFor="email">Email</Label>
											<FormControl>
												<Input
													{...field}
													id="email"
													type="email"
													placeholder="m@example.com"
													required
												/>
											</FormControl>
										</div>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<div className="grid gap-2">
										<Label htmlFor="password">Password</Label>
										<FormControl>
											<Input {...field} id="password" autoComplete="off" type="password" required />
										</FormControl>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={isLoggingIn}>
							{isLoggingIn ? "Logging in..." : "Login"}
						</Button>

						{loginError && <Alert variant="destructive">Usuario o contraseña incorrectos</Alert>}

						<div className="mt-4 text-center text-sm">
							Don&apos;t have an account?{" "}
							<Link to="#" className="underline">
								Sign up
							</Link>
							<Link to="#" className="ml-auto inline-block text-sm underline">
								Forgot your password?
							</Link>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
