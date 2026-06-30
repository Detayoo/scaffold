"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { PasswordField } from "@/components/TextField";
import { FormField } from "@/components/FormField";
import { AuthLayout } from "@/components/AuthLayout";
import { AsyncContent } from "@/components/AsyncContent";
import { getSingleInviteFn, acceptInviteFn } from "@/services";
import { extractError } from "@/services";
import { toastMessage } from "@/utils";
import { acceptInviteSchema } from "@/utils/validators";

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  const router = useRouter();

  const { data, isPending, isError } = useQuery({
    queryKey: ["invite", reference],
    queryFn: () => getSingleInviteFn(reference),
  });

  const invite = data?.data;

  const form = useForm<z.infer<typeof acceptInviteSchema>>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  useEffect(() => {
    if (invite) {
      reset({
        email: (invite as any)?.email ?? "",
        firstName: "",
        lastName: "",
        password: "",
      });
    }
  }, [invite, reset]);


  const onSubmit = async (data: z.infer<typeof acceptInviteSchema>) => {
    try {
      await acceptInviteFn({ ...data, reference });
      toastMessage("success", "Account created");
      router.push("/");
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  return (
    <AuthLayout>
      <AsyncContent isPending={isPending} isError={isError} errorMessage="This invite link is invalid or has expired.">
      <div className="space-y-6">
          <PageHeader title="Accept invite" description={invite?.merchantName ? `You've been invited to join ${invite.merchantName}.` : "You've been invited to join a merchant account."} />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email" error={errors.email?.message} isRequired>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                readOnly
                className="bg-muted/50"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="First name" error={errors.firstName?.message} isRequired>
                <Input
                  placeholder="John"
                  {...register("firstName")}
                />
              </FormField>
              <FormField label="Last name" error={errors.lastName?.message} isRequired>
                <Input
                  placeholder="Doe"
                  {...register("lastName")}
                />
              </FormField>
            </div>
            <FormField label="Password" error={errors.password?.message} isRequired>
              <PasswordField
                placeholder="At least 8 characters"
                {...register("password")}
              />
            </FormField>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Create account
            </Button>
          </form>
        </div>
      </AsyncContent>
    </AuthLayout>
  );
}
