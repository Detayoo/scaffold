"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/TextField";
import { FormField } from "@/components/FormField";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/contexts/auth-context";
import { loginFn } from "@/services";
import { extractError } from "@/services";
import { toastMessage } from "@/utils";
import { loginSchema } from "@/utils/validators";

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser, setMerchant } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const res = await loginFn(data);
      const d = res?.data;
      if (d?.token) setToken(d.token);
      if (d?.user) setUser(d.user);
      if (d?.merchant) setMerchant(d.merchant);
      toastMessage("success", "Logged in");
      router.push("/home");
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account.
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
            <PasswordField placeholder="Enter your password" {...register("password")} />
          </FormField>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Log in
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
