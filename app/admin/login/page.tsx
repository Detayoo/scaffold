"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/TextField";
import { FormField } from "@/components/FormField";
import { AuthLayout } from "@/components/AuthLayout";
import { adminLoginFn } from "@/services";
import { extractError } from "@/services";
import { toastMessage } from "@/utils";
import { useAdminAuth } from "@/contexts/admin-auth-context";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().nonempty("Password is required"),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAdminAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const res = await adminLoginFn(data);
      const d = res?.data;
      if (d?.token) setToken(d.token);
      if (d?.user) setUser(d.user);
      toastMessage("success", "Logged in");
      router.push("/admin");
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to the admin dashboard.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message} isRequired>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
          </FormField>
          <FormField label="Password" error={errors.password?.message} isRequired>
            <PasswordField
              placeholder="Enter your password"
              {...register("password")}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
