"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { use } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/TextField";
import { FormField } from "@/components/FormField";
import { AuthLayout } from "@/components/AuthLayout";
import { LoadingState } from "@/components/LoadingState";
import { previewInviteFn, acceptInviteFn } from "@/services";
import { extractError } from "@/services";
import { toastMessage } from "@/utils";

const acceptSchema = z.object({
  name: z.string().nonempty("Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const router = useRouter();
  const { reference: token } = use(params);
  const [preview, setPreview] = useState<{ email: string; role: string; merchant: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof acceptSchema>>({
    resolver: zodResolver(acceptSchema),
  });

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        if (!token) {
          setError(true);
          setLoading(false);
          return;
        }
        const res = await previewInviteFn(token);
        const d = res?.data;
        if (d?.invitation) {
          setPreview({ email: d.invitation.email, role: d.invitation.role, merchant: d.merchant?.display_name ?? "" });
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [token]);

  const { mutateAsync: acceptInvite, isPending: accepting } = useMutation({
    mutationFn: acceptInviteFn,
    onSuccess: () => {
      toastMessage("success", "Account created. Please log in.");
      router.push("/");
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const onSubmit = async (data: z.infer<typeof acceptSchema>) => {
    try {
      await acceptInvite({ token, name: data.name, password: data.password });
    } catch {}
  };

  const handleRetry = async () => {
    setError(false);
    setLoading(true);
    try {
      const res = await previewInviteFn(token);
      const d = res?.data;
      if (d?.invitation) {
        setPreview({ email: d.invitation.email, role: d.invitation.role, merchant: d.merchant?.display_name ?? "" });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!token || error) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">This invite link is invalid or has expired.</p>
          {error && (
            <Button variant="outline" onClick={handleRetry}>
              Retry
            </Button>
          )}
        </div>
      </AuthLayout>
    );
  }

  if (loading) {
    return (
      <AuthLayout>
        <LoadingState />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">Accept invitation</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;ve been invited to join <span className="font-medium text-foreground">{preview?.merchant}</span> as <span className="font-medium text-foreground">{preview?.role}</span>
          </p>
          <p className="text-sm text-muted-foreground">Email: {preview?.email}</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Full name" error={errors.name?.message} isRequired>
            <Input placeholder="Ada Developer" {...register("name")} />
          </FormField>
          <FormField label="Password" error={errors.password?.message} isRequired>
            <PasswordField placeholder="At least 6 characters" {...register("password")} />
          </FormField>
          <Button type="submit" className="w-full" disabled={accepting || isSubmitting}>
            {(accepting || isSubmitting) && <Loader2 className="size-4 animate-spin" />}
            Create account
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
