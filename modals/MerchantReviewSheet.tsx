"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/FormField";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { StatusBadge } from "@/components/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { reviewMerchantFn } from "@/services";
import { toastMessage, extractError } from "@/utils";
import type { Merchant } from "@/types";

const schema = z.object({
  status: z.string().nonempty("Status is required"),
  riskTier: z.string().nonempty("Risk tier is required"),
  note: z.string().optional(),
});

type ReviewForm = z.infer<typeof schema>;

interface MerchantReviewSheetProps {
  merchant: Merchant | null;
  onOpenChange: (open: boolean) => void;
}

export function MerchantReviewSheet({ merchant, onOpenChange }: MerchantReviewSheetProps) {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ReviewForm>({
    resolver: zodResolver(schema),
    values: { status: merchant?.status ?? "", riskTier: "standard", note: "" },
  });

  const { mutateAsync: review, isPending: reviewing } = useMutation({
    mutationFn: reviewMerchantFn,
    onSuccess: () => {
      toastMessage("success", "Merchant updated");
      setSubmitted(true);
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleReview = form.handleSubmit(async ({ status, riskTier, note }) => {
    try {
      await review({ id: merchant?.id ?? "", status, riskTier, note: note || undefined });
    } catch {
      // handled by onError
    }
  });

  return (
    <ResponsiveSheet
      open={!!merchant}
      onOpenChange={(o) => { if (!o) { onOpenChange(false); setSubmitted(false); form.reset(); } }}
      title="Merchant Review"
    >
      {merchant ? (
        <div className="space-y-4 pt-2">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium text-foreground">{merchant?.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">{merchant?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Status</p>
              <StatusBadge status={merchant?.status} size="sm" />
            </div>
          </div>

          <Separator />

          {submitted ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Merchant has been updated.</p>
              <Button variant="outline" className="w-full" onClick={() => { onOpenChange(false); setSubmitted(false); form.reset(); }}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReview} className="space-y-4">
              <FormField label="New Status" error={form.formState.errors.status?.message} isRequired>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Risk Tier" error={form.formState.errors.riskTier?.message} isRequired>
                <Select
                  value={form.watch("riskTier")}
                  onValueChange={(v) => form.setValue("riskTier", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Note" error={form.formState.errors.note?.message}>
                <Textarea {...form.register("note")} placeholder="Review note (optional)" className="min-h-20" />
              </FormField>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={reviewing}>{reviewing ? "Updating..." : "Update Merchant"}</Button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </ResponsiveSheet>
  );
}
