"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PasswordField } from "@/components/TextField";
import { FormField } from "@/components/FormField";
import { AuthLayout } from "@/components/AuthLayout";
import { LoadingState } from "@/components/LoadingState";
import { resetPasswordFn } from "@/services";
import { extractError } from "@/services";
import { toastMessage } from "@/utils";
import { resetPasswordSchema } from "@/utils/validators";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      password: "",
      confirm_password: "",
    },
  });

  const code = watch("code");

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!email) return;
    try {
      await resetPasswordFn({ otp: data.code, password: data.password, email });
      toastMessage("success", "Password reset");
      router.push("/");
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  if (!email) {
    return (
      <AuthLayout>
        <div className="text-center text-sm text-muted-foreground">
          No email provided. Please request a password reset first.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            Enter the reset code sent to{" "}
            <span className="font-medium text-foreground">{email}</span> and
            choose a new password.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Reset code</p>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(val) => setValue("code", val, { shouldValidate: true })}
              className="w-full"
            >
              <InputOTPGroup className="flex w-full items-center justify-between gap-0">
                {[0, 1, 2].map((i) => (
                  <InputOTPSlot key={i} index={i} className="flex size-12 items-center justify-center rounded-lg border border-input bg-background text-lg font-semibold text-foreground transition-all duration-150 data-[active=true]:border-foreground data-[active=true]:ring-2 data-[active=true]:ring-ring/50" />
                ))}
                <span key="sep" className="text-lg text-muted-foreground/40 font-semibold select-none">—</span>
                {[3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="flex size-12 items-center justify-center rounded-lg border border-input bg-background text-lg font-semibold text-foreground transition-all duration-150 data-[active=true]:border-foreground data-[active=true]:ring-2 data-[active=true]:ring-ring/50" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {errors.code?.message && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>
          <FormField label="New password" error={errors.password?.message} isRequired>
            <PasswordField
              placeholder="At least 6 characters"
              {...register("password")}
            />
          </FormField>
          <FormField
            label="Confirm password"
            error={errors.confirm_password?.message}
            isRequired
          >
            <PasswordField
              placeholder="Repeat your password"
              {...register("confirm_password")}
            />
          </FormField>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Reset password
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
