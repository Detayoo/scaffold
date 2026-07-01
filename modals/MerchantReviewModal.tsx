"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/FormField";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { getAdminMerchantDetailFn, reviewMerchantFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const schema = z.object({
  status: z.string().nonempty("Status is required"),
  riskTier: z.string().nonempty("Risk tier is required"),
  reason: z.string().optional(),
});

type ReviewForm = z.infer<typeof schema>;

interface MerchantReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId: string;
  onSuccess?: () => void;
}

export function MerchantReviewModal({ open, onOpenChange, merchantId, onSuccess }: MerchantReviewModalProps) {
  const { data } = useQuery({
    queryKey: ["admin-merchant-detail", merchantId],
    queryFn: () => getAdminMerchantDetailFn({ id: merchantId }),
    enabled: open,
  });

  const merchant = data?.data?.merchant;

  const form = useForm<ReviewForm>({
    resolver: zodResolver(schema),
    values: { status: merchant?.status ?? "", riskTier: merchant?.risk_tier ?? "", reason: "" },
  });

  const { mutateAsync: review, isPending: reviewing } = useMutation({
    mutationFn: reviewMerchantFn,
    onSuccess: () => {
      toastMessage("success", "Merchant reviewed");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleReview = form.handleSubmit(async ({ status, riskTier, reason }) => {
    try {
      await review({ id: merchantId, status, riskTier, reason: reason || undefined });
    } catch {}
  });

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Review Merchant">
      <form onSubmit={handleReview} className="space-y-4 pt-2">
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
          <p className="text-xs text-muted-foreground">Merchant</p>
          <p className="text-sm font-medium text-foreground">{merchant?.display_name ?? "—"}</p>
        </div>
        <FormField label="Status" error={form.formState.errors.status?.message} isRequired>
          <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Risk Tier" error={form.formState.errors.riskTier?.message} isRequired>
          <Select value={form.watch("riskTier")} onValueChange={(v) => form.setValue("riskTier", v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Reason">
          <Textarea {...form.register("reason")} placeholder="Review reason (optional)" className="min-h-20" />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={reviewing}>Cancel</Button>
          <Button type="submit" disabled={reviewing}>{reviewing ? "Reviewing..." : "Review"}</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
