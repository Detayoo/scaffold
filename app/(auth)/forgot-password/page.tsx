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
import { FormField } from "@/components/FormField";
import { AuthLayout } from "@/components/AuthLayout";
import { forgotPasswordFn } from "@/services";
import { extractError } from "@/services";
import { toastMessage } from "@/utils";
import { forgotPasswordSchema } from "@/utils/validators";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      await forgotPasswordFn(data.email);
      toastMessage("success", "Reset code sent");
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
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
          <h1 className="text-xl font-semibold">Forgot password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a reset code.
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Send reset code
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
