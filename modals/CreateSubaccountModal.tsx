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
import { createSubaccountFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const schema = z.object({
  name: z.string().nonempty("Name is required"),
  settlementBankAccountId: z.string().nonempty("Bank account ID is required"),
  environment: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateSubaccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSubaccountModal({ open, onOpenChange, onSuccess }: CreateSubaccountModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", settlementBankAccountId: "", environment: "test" },
  });

  const { mutateAsync: createSubaccount, isPending: creating } = useMutation({
    mutationFn: createSubaccountFn,
    onSuccess: () => {
      toastMessage("success", "Subaccount created");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCreate = form.handleSubmit(async ({ name, settlementBankAccountId, environment }) => {
    try {
      await createSubaccount({ name, settlementBankAccountId, environment: environment || undefined });
    } catch {
      // handled by onError
    }
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o && !creating) { onOpenChange(false); form.reset(); } }}
      title="Create Subaccount"
      description="Add a new split settlement recipient"
    >
      <form onSubmit={handleCreate} className="space-y-4 pt-2">
        <FormField label="Name" error={form.formState.errors.name?.message} isRequired>
          <Input {...form.register("name")} placeholder="Balogun Rice Seller" />
        </FormField>
        <FormField label="Settlement Bank Account ID" error={form.formState.errors.settlementBankAccountId?.message} isRequired>
          <Input {...form.register("settlementBankAccountId")} placeholder="gtb_0123456789" />
        </FormField>
        <FormField label="Environment" error={form.formState.errors.environment?.message}>
          <Select
            value={form.watch("environment")}
            onValueChange={(v) => form.setValue("environment", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="live">Live</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>Cancel</Button>
          <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Subaccount"}</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
