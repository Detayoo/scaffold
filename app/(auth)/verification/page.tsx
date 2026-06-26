"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion/dom";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Countdown from "react-countdown";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { FormField } from "@/components/FormField";
import { AuthLayout } from "@/components/AuthLayout";
import { LoadingState } from "@/components/LoadingState";
import { verifyOtpFn, resendOtpFn } from "@/services";
import { extractError } from "@/services";
import { toastMessage } from "@/utils";

const otpSchema = z.object({
  otp: z.string().length(6, { message: "Code must be 6 digits" }),
});

function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [countdownDate, setCountdownDate] = useState<number | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const otp = watch("otp");

  const onSubmit = async (data: z.infer<typeof otpSchema>) => {
    try {
      await verifyOtpFn({ otp: data.otp, email });
      toastMessage("success", "Email verified");
      router.push("/");
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await resendOtpFn({ email });
      toastMessage("success", "Verification code resent");
      setCountdownDate(Date.now() + 60000);
    } catch (error) {
      toastMessage("error", extractError(error));
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <AuthLayout>
        <div className="text-center text-sm text-muted-foreground">
          No email provided. Please register first.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a 6-digit verification code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField label="Verification code" error={errors.otp?.message} isRequired>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(val) => setValue("otp", val, { shouldValidate: true })}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </FormField>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Verify email
          </Button>
        </form>
        <div className="flex items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">Didn&apos;t receive a code?</span>
          {countdownDate ? (
            <Countdown
              date={countdownDate}
              onComplete={() => setCountdownDate(null)}
              renderer={({ seconds, completed }) => {
                if (completed) {
                  return (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-sm font-medium"
                      onClick={handleResend}
                      disabled={isResending}
                    >
                      {isResending ? "Sending..." : "Resend code"}
                    </Button>
                  );
                }
                return (
                  <span className="text-muted-foreground">
                    Resend in {seconds}s
                  </span>
                );
              }}
            />
          ) : (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm font-medium"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend code"}
            </Button>
          )}
        </div>
      </motion.div>
    </AuthLayout>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerificationForm />
    </Suspense>
  );
}
