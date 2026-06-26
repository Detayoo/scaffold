"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/TextField";
import { FormField } from "@/components/FormField";
import { AuthLayout } from "@/components/AuthLayout";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { getSingleInviteFn, acceptInviteFn } from "@/services";
import { extractError } from "@/services";
import { toastMessage } from "@/utils";
import { acceptInviteSchema } from "@/utils/validators";
import type { SingleInvite } from "@/types";

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  const router = useRouter();

  const [invite, setInvite] = useState<SingleInvite["data"] | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isError, setIsError] = useState(false);

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
    const loadInvite = async () => {
      try {
        const res = await getSingleInviteFn(reference);
        const data = res?.data;
        if (data) {
          setInvite(data);
          reset({
            email: data.email ?? "",
            firstName: data.firstName ?? "",
            lastName: data.lastName ?? "",
            password: "",
          });
        } else {
          setIsError(true);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsFetching(false);
      }
    };
    loadInvite();
  }, [reference, reset]);

  const onSubmit = async (data: z.infer<typeof acceptInviteSchema>) => {
    try {
      await acceptInviteFn({ ...data, reference });
      toastMessage("success", "Account created");
      router.push("/");
    } catch (error) {
      toastMessage("error", extractError(error));
    }
  };

  if (isFetching) {
    return (
      <AuthLayout>
        <LoadingState message="Loading invite..." />
      </AuthLayout>
    );
  }

  if (isError) {
    return (
      <AuthLayout>
        <ErrorState message="This invite link is invalid or has expired." />
      </AuthLayout>
    );
  }

  if (!invite) {
    return (
      <AuthLayout>
        <ErrorState message="This invite link is invalid or has expired." />
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
          <h1 className="text-xl font-semibold">Accept invite</h1>
          <p className="text-sm text-muted-foreground">
            {invite?.merchantName
              ? `You've been invited to join ${invite.merchantName}.`
              : "You've been invited to join a merchant account."}
          </p>
        </div>
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
                readOnly
                className="bg-muted/50"
              />
            </FormField>
            <FormField label="Last name" error={errors.lastName?.message} isRequired>
              <Input
                placeholder="Doe"
                {...register("lastName")}
                readOnly
                className="bg-muted/50"
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
      </motion.div>
    </AuthLayout>
  );
}
