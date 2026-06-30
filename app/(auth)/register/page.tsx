"use client";

import { use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/TextField";
import { FormField } from "@/components/FormField";
import { AuthLayout } from "@/components/AuthLayout";
import { registerFn } from "@/services";
import { extractError } from "@/services";
import { toastMessage } from "@/utils";
import { registrationSchema } from "@/utils/validators";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email: prefilledEmail } = use(searchParams);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: prefilledEmail ?? "",
    },
  });

  const onSubmit = async (data: z.infer<typeof registrationSchema>) => {
    try {
      await registerFn(data);
      toastMessage("success", "Account created");
      router.push(`/verification?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Fill in your details to get started.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Business name" error={errors.businessName?.message} isRequired>
            <Input placeholder="Your business name" {...register("businessName")} />
          </FormField>
          <FormField label="Full name" error={errors.name?.message} isRequired>
            <Input placeholder="Full name of the business owner" {...register("name")} />
          </FormField>
          <FormField label="Email" error={errors.email?.message} isRequired>
            <Input type="email" placeholder="you@example.com" {...register("email")} />
          </FormField>
          <FormField label="Password" error={errors.password?.message} isRequired>
            <PasswordField placeholder="At least 6 characters" {...register("password")} />
          </FormField>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Create account
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
