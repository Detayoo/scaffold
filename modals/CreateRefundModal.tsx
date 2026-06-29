"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createRefundFn } from "@/services";
import { toastMessage, extractError, formatMoney } from "@/utils";

const createSchema = z.object({
  amount: z.string().nonempty("Amount is required"),
  reference: z.string().nonempty("Reference is required"),
  currency: z.string().nonempty("Currency is required"),
  reason: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

interface CreateRefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateRefundModal({ open, onOpenChange, onSuccess }: CreateRefundModalProps) {
  const [newRefund, setNewRefund] = useState<{ reference: string; amountMinor: number; status: string } | null>(null);

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { amount: "", reference: "", currency: "NGN", reason: "" },
  });

  const { mutateAsync: createRefund, isPending: creating } = useMutation({
    mutationFn: createRefundFn,
    onSuccess: (res) => {
      toastMessage("success", "Refund request created");
      setNewRefund({
        reference: res?.data?.reference ?? "",
        amountMinor: res?.data?.amountMinor ?? 0,
        status: res?.data?.status ?? "requested",
      });
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCreate = form.handleSubmit(async ({ amount, reference, currency, reason }) => {
    try {
      await createRefund({
        amount: Number(amount) * 100,
        reference,
        currency,
        reason: reason || undefined,
      });
    } catch {
      // handled by onError callback
    }
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o && !creating && !newRefund) { onOpenChange(false); form.reset(); } if (!o && newRefund) { onOpenChange(false); setNewRefund(null); form.reset(); } }}
      title="Create Refund"
      description="Issue a refund for a payment"
    >
      {newRefund ? (
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">Refund request created successfully!</p>
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Reference</p>
            <p className="text-sm font-medium">{newRefund.reference}</p>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-sm font-medium">{formatMoney(newRefund.amountMinor)}</p>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium capitalize">{newRefund.status}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setNewRefund(null)}>
            Create Another
          </Button>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <FormField label="Amount (NGN)" error={form.formState.errors.amount?.message} isRequired>
            <Input {...form.register("amount")} type="number" step="any" placeholder="10000" className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          </FormField>
          <FormField label="Reference" error={form.formState.errors.reference?.message} isRequired>
            <Input {...form.register("reference")} placeholder="Original payment reference" />
          </FormField>
          <FormField label="Currency" isRequired>
            <Select
              value={form.watch("currency")}
              onValueChange={(v) => form.setValue("currency", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">NGN</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Reason" error={form.formState.errors.reason?.message}>
            <Textarea {...form.register("reason")} placeholder="Reason for refund (optional)" className="min-h-20" />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Refund"}</Button>
          </div>
        </form>
      )}
    </ResponsiveModal>
  );
}
