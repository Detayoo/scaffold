"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/FormField";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { createPaylinkFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const createSchema = z.object({
  reference: z.string().nonempty("Reference is required"),
  amount: z.string().nonempty("Amount is required"),
  currency: z.string().nonempty("Currency is required"),
  status: z.string().nonempty("Status is required"),
  cardChannel: z.boolean().optional(),
  transferChannel: z.boolean().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

interface CreatePaymentLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePaymentLinkModal({ open, onOpenChange, onSuccess }: CreatePaymentLinkModalProps) {
  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { reference: "", amount: "", currency: "NGN", status: "active", cardChannel: true, transferChannel: true },
  });

  const cardChannel = form.watch("cardChannel");
  const transferChannel = form.watch("transferChannel");

  const { mutateAsync: createPaylink, isPending: creating } = useMutation({
    mutationFn: createPaylinkFn,
    onSuccess: () => {
      toastMessage("success", "Payment link created");
      onSuccess?.();
      onOpenChange(false);
      form.reset();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCreate = form.handleSubmit(async ({ reference, amount, currency, status, cardChannel, transferChannel }) => {
    try {
      const channels: string[] = [];
      if (cardChannel) channels.push("card");
      if (transferChannel) channels.push("bank_transfer");
      await createPaylink({ reference, amount: Number(amount), currency, channels, status });
    } catch {}
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o && !creating) { onOpenChange(false); form.reset(); } }}
      title="Create Payment Link"
      description="Generate a new shareable payment link"
    >
      <form onSubmit={handleCreate} className="space-y-4 pt-2">
        <FormField label="Amount (NGN)" error={form.formState.errors.amount?.message} isRequired>
          <Input {...form.register("amount")} type="number" step="any" placeholder="10000" className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </FormField>
        <FormField label="Reference" error={form.formState.errors.reference?.message} isRequired>
          <Input {...form.register("reference")} placeholder="pl_my_unique_ref" />
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
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Status" isRequired>
          <Select
            value={form.watch("status")}
            onValueChange={(v) => form.setValue("status", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Channels</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cardChannel}
                onChange={(e) => form.setValue("cardChannel", e.target.checked)}
                className="size-4 rounded border-border text-foreground focus:ring-ring"
              />
              <span className="text-sm">Card</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={transferChannel}
                onChange={(e) => form.setValue("transferChannel", e.target.checked)}
                className="size-4 rounded border-border text-foreground focus:ring-ring"
              />
              <span className="text-sm">Bank Transfer</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>Cancel</Button>
          <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Link"}</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
