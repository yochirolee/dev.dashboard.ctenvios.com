import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
// Form components that pre-bind events from the form hook; check our "Form Composition" guide for more
// We also support Valibot, ArkType, and any other standard schema library
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { customerSchema } from "@/data/types";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const { fieldContext, formContext } = createFormHookContexts();

// Allow us to bind components to the form to keep type safety but reduce production boilerplate
// Define this once to have a generator of consistent form instances throughout your app
const { useAppForm } = createFormHook({
	fieldComponents: {
		Input,
	},
	formComponents: {
		Button,
	},
	fieldContext,
	formContext,
});

export const TskCustomerForm = () => {
	const form = useAppForm({
		defaultValues: {
			first_name: "",
			last_name: "",
			second_name: "",
			second_last_name: "",
			identity_document: "",
			email: "",
			phone: "",
			address: "",
			people: [] as Array<{ name: string }>,
		},
		validators: {
			// Pass a schema or function to validate
			onChange: z.object({
				first_name: z.string().min(3),
				last_name: z.string().min(3),
				second_name: z.string().min(3),
				second_last_name: z.string().min(3),
				identity_document: z.string().min(3),
				email: z.string(),
				phone: z.string(),
				address: z.string(),
				people: z.array(z.object({ name: z.string().min(3) })),
			}),
		},
		onSubmit: ({ value }) => {
			// Do something with form data
			alert(JSON.stringify(value, null, 2));
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<h1>Personal Information</h1>
			{/* Components are bound to `form` and `field` to ensure extreme type safety */}
			{/* Use `form.AppField` to render a component bound to a single field */}
			<form.Field
				name="first_name"
				children={(field) => (
					<div className="flex flex-col gap-2 max-w-md">
						<Label htmlFor="first-name">First Name</Label>
						<Input
							id="first-name"
							name="first-name"
							type="text"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
						{field.state.meta.errors && (
							<p className="text-red-500 text-sm mt-1">
								{field.state.meta.errors.map((error) => error?.message).join(", ")}
							</p>
						)}
					</div>
				)}
			/>
			<div className="flex flex-col gap-2 max-w-md">
				<form.Field
					name="last_name"
					children={(field) => (
						<div className="flex flex-col gap-2 max-w-md">
							<Label htmlFor="last-name">Last Name</Label>
							<Input
								id="last-name"
								name="last-name"
								type="text"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						</div>
					)}
				/>
				<form.Field
					name="second_name"
					children={(field) => (
						<div className="flex flex-col gap-2 max-w-md">
							<Label htmlFor="second-name">Second Name</Label>
							<Input
								id="second-name"
								name="second-name"
								type="text"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors && (
								<p className="text-red-500 text-sm mt-1">
									{field.state.meta.errors.map((error) => error?.message).join(", ")}
								</p>
							)}
						</div>
					)}
				/>

				<form.Field
					name="second_last_name"
					children={(field) => (
						<div className="flex flex-col gap-2 max-w-md">
							<Label htmlFor="second-last-name">Second Last Name</Label>
							<Input
								id="second-last-name"
								name="second-last-name"
								type="text"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors && (
								<p className="text-red-500 text-sm mt-1">
									{field.state.meta.errors.map((error) => error?.message).join(", ")}
								</p>
							)}
						</div>
					)}
				/>
				<form.Field
					name="identity_document"
					children={(field) => (
						<div className="flex flex-col gap-2 max-w-md">
							<Label htmlFor="identity-document">Identity Document</Label>
							<Input
								id="identity-document"
								name="identity-document"
								type="text"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors && (
								<p className="text-red-500 text-sm mt-1">
									{field.state.meta.errors.map((error) => error?.message).join(", ")}
								</p>
							)}
						</div>
					)}
				/>
				<form.Field
					name="email"
					children={(field) => (
						<div className="flex flex-col gap-2 max-w-md">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors && (
								<p className="text-red-500 text-sm mt-1">
									{field.state.meta.errors.map((error) => error?.message).join(", ")}
								</p>
							)}
						</div>
					)}
				/>
				<form.Field
					name="phone"
					children={(field) => (
						<div className="flex flex-col gap-2 max-w-md">
							<Label htmlFor="phone">Phone</Label>
							<Input
								id="phone"
								name="phone"
								type="text"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors && (
								<p className="text-red-500 text-sm mt-1">
									{field.state.meta.errors.map((error) => error?.message).join(", ")}
								</p>
							)}
						</div>
					)}
				/>
				<form.Field
					name="address"
					children={(field) => (
						<div className="flex flex-col gap-2 max-w-md">
							<Label htmlFor="address">Address</Label>
							<Input
								id="address"
								name="address"
								type="text"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
							{field.state.meta.errors && (
								<p className="text-red-500 text-sm mt-1">
									{field.state.meta.errors.map((error) => error?.message).join(", ")}
								</p>
							)}
						</div>
					)}
				/>
				<Card>
					{" "}
					<CardHeader>
						<CardTitle>People</CardTitle>
						<CardDescription>Add people to the customer</CardDescription>
					</CardHeader>
					<form.Field name="people" mode="array">
						{(field) => {
							return (
								<div>
									<button onClick={() => field.pushValue({ name: "" })} type="button">
										Add person
									</button>
									{field.state.value.length}
									{field.state.value.map((_, i) => {
										return (
											<form.Field key={i} name={`people[${i}].name`}>
												{(subField) => {
													return (
														<div className="flex flex-col gap-2 max-w-md">
															<Label htmlFor={`people[${i}].name`}>Name for person {i}</Label>
															<Input
																value={subField.state.value}
																onChange={(e) => subField.handleChange(e.target.value)}
															/>
															{subField.state.meta.errors && (
																<p className="text-red-500 text-sm mt-1">
																	{subField.state.meta.errors
																		.map((error) => error?.message)
																		.join(", ")}
																</p>
															)}
														</div>
													);
												}}
											</form.Field>
										);
									})}
								</div>
							);
						}}
					</form.Field>
				</Card>
			</div>

			{/* The "name" property will throw a TypeScript error if typo'd  */}
			{/* Components in `form.AppForm` have access to the form context */}
			<Button type="submit" onClick={() => form.handleSubmit()}>
				Submit
			</Button>
		</form>
	);
};
