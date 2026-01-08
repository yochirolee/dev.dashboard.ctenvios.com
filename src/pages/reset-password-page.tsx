import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useResetPassword } from "@/hooks/use-users";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
const formSchema = z
   .object({
      newPassword: z.string().min(8, "New password must be at least 8 characters"),
      confirmNewPassword: z.string().min(8, "Confirm new password must be at least 8 characters"),
      token: z.string().min(1, "Token is required"),
   })
   .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Passwords do not match",
      path: ["confirmNewPassword"],
   });

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordPage({ ...props }: React.ComponentProps<typeof Card>) {
   const [searchParams] = useSearchParams();
   const token = searchParams.get("token") || "";
   const navigate = useNavigate();
   const resetPasswordMutation = useResetPassword();

   const form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         newPassword: "",
         confirmNewPassword: "",
         token: token || "",
      },
   });

   const onSubmit = (values: FormValues) => {
      resetPasswordMutation.mutate(
         { token, newPassword: values.newPassword },
         {
            onSuccess: () => {
               toast.success("Password reset successfully");
               navigate("/login");
            },
            onError: (error) => {
               console.error(error, "on Mutation Error");
               toast.error((error as any).response?.data?.message || "Error al resetear la contraseña");
            },
         }
      );
   };

   return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
         <div className="w-full max-w-sm">
            <Card {...props}>
               <CardHeader>
                  <CardTitle>Reset Password</CardTitle>
                  <CardDescription>Enter your new password below to reset your password</CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                     <Field>
                        <FieldGroup>
                           <Controller
                              name="newPassword"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                 <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                                    <Input {...field} id="new-password" type="password" placeholder="********" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                 </Field>
                              )}
                           />

                           <Controller
                              name="confirmNewPassword"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                 <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="confirm-new-password">Confirm New Password</FieldLabel>
                                    <Input
                                       {...field}
                                       id="confirm-new-password"
                                       type="password"
                                       placeholder="********"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                 </Field>
                              )}
                           />
                        </FieldGroup>

                        <FieldSeparator className="my-2" />
                        <Button type="submit" className="w-full">
                           {resetPasswordMutation.isPending ? <Spinner /> : "Reset Password"}
                        </Button>
                     </Field>
                  </form>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
