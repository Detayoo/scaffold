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
import { SearchableSelect } from "@/components/SearchableSelect";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { createAdminDisputeFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const MOCK_OWNERS = [
  { id: "ops_lagos_01", name: "Finance Ops Lagos" },
  { id: "ops_abuja_02", name: "Finance Ops Abuja" },
  { id: "ops_port_03", name: "Finance Ops Port Harcourt" },
];

const schema = z.object({
  reference: z.string().nonempty("Reference is required"),
  amount: z.string().nonempty("Amount is required"),
  reason: z.string().nonempty("Reason is required"),
  ownerId: z.string().nonempty("Owner is required"),
  ownerName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateAdminDisputeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAdminDisputeModal({ open, onOpenChange, onSuccess }: CreateAdminDisputeModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { reference: "", amount: "", reason: "", ownerId: "", ownerName: "" },
  });

  const { mutateAsync: createDispute, isPending: creating } = useMutation({
    mutationFn: createAdminDisputeFn,
    onSuccess: () => {
      toastMessage("success", "Dispute opened");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCreate = form.handleSubmit(async ({ reference, amount, reason, ownerId, ownerName }) => {
    try {
      await createDispute({
        reference,
        amount: Number(amount),
        reason,
        ownerId,
        ownerName: ownerName || "",
      });
    } catch {
      // handled by onError
    }
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o && !creating) { onOpenChange(false); form.reset(); } }}
      title="Open Dispute"
      description="Open a dispute case as platform admin"
    >
      <form onSubmit={handleCreate} className="space-y-4 pt-2">
        <FormField label="Reference" error={form.formState.errors.reference?.message} isRequired>
          <Input {...form.register("reference")} placeholder="Original payment reference" />
        </FormField>
        <FormField label="Amount" error={form.formState.errors.amount?.message} isRequired>
          <Input {...form.register("amount")} type="number" step="any" placeholder="1250000" className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </FormField>
        <FormField label="Reason" error={form.formState.errors.reason?.message} isRequired>
          <Textarea {...form.register("reason")} placeholder="Customer claims goods were not delivered" className="min-h-20" />
        </FormField>
        <FormField label="Owner" error={form.formState.errors.ownerId?.message} isRequired>
          <SearchableSelect
            options={MOCK_OWNERS.map((o) => ({ value: o.id, label: o.name }))}
            value={form.watch("ownerId")}
            onValueChange={(v) => { const o = MOCK_OWNERS.find((x) => x.id === v); form.setValue("ownerId", v); form.setValue("ownerName", o?.name ?? ""); }}
            placeholder="Select owner"
            searchPlaceholder="Search owners..."
          />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>Cancel</Button>
          <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Open Dispute"}</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
