import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/stores/app-store";
import { useLoginMutation } from "@/hooks/use-users";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "../ui/field";

const formSchema = z.object({
   email: z.string().email({ message: "Please enter a valid email address" }),
   password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
   const { mutate: login, isPending, isError } = useLoginMutation();
   const { session } = useAppStore();
   const navigate = useNavigate();

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

   if (session) {
      navigate("/", { replace: true });
   }

   return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
         <Card>
            <CardHeader>
               <CardTitle className="text-2xl">Login</CardTitle>
               <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <Field>
                     <FieldGroup>
                        <Controller
                           name="email"
                           control={form.control}
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel htmlFor="email">Email</FieldLabel>
                                 <Input {...field} type="email" placeholder="Enter your email" />
                                 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                           )}
                        />

                        <Controller
                           name="password"
                           control={form.control}
                           render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                 <FieldLabel htmlFor="password">Password</FieldLabel>
                                 <Input {...field} type="password" placeholder="Enter your password" />
                                 {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                           )}
                        />
                     </FieldGroup>

                     <FieldSeparator className="my-2" />
                     <Button
                        type="submit"
                        className="w-full  inline-flex items-center justify-center gap-2"
                        disabled={isPending}
                     >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{isPending ? "Logging in..." : "Login"}</span>
                     </Button>

                     {isError && <p className="text-red-500 text-sm mt-1 text-center">Invalid email or password</p>}
                  </Field>
               </form>
            </CardContent>
         </Card>
      </div>
   );
}
