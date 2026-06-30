"use client";

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
import { createAdminRefundFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const schema = z.object({
  reference: z.string().nonempty("Reference is required"),
  amount: z.string().nonempty("Amount is required"),
  currency: z.string().nonempty("Currency is required"),
  reason: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateAdminRefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAdminRefundModal({ open, onOpenChange, onSuccess }: CreateAdminRefundModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { reference: "", amount: "", currency: "NGN", reason: "" },
  });

  const { mutateAsync: createRefund, isPending: creating } = useMutation({
    mutationFn: createAdminRefundFn,
    onSuccess: () => {
      toastMessage("success", "Refund created");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCreate = form.handleSubmit(async ({ reference, amount, currency, reason }) => {
    try {
      await createRefund({
        reference,
        amount: Number(amount),
        currency,
        executionMode: "manual",
        feePolicy: "refund_pro_rata_fee",
        reason: reason || undefined,
        evidence: {},
        metadata: {},
      });
    } catch {
      // handled by onError
    }
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o && !creating) { onOpenChange(false); form.reset(); } }}
      title="Create Refund"
      description="Issue a refund as platform admin"
    >
      <form onSubmit={handleCreate} className="space-y-4 pt-2">
        <FormField label="Reference" error={form.formState.errors.reference?.message} isRequired>
          <Input {...form.register("reference")} placeholder="Original payment reference" />
        </FormField>
        <FormField label="Amount" error={form.formState.errors.amount?.message} isRequired>
          <Input {...form.register("amount")} type="number" step="any" placeholder="250000" className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </FormField>
        <FormField label="Currency" isRequired>
          <Select value={form.watch("currency")} onValueChange={(v) => form.setValue("currency", v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Reason">
          <Textarea {...form.register("reason")} placeholder="Reason for refund (optional)" className="min-h-20" />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>Cancel</Button>
          <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Refund"}</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
