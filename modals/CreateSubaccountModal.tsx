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

const BANKS = [
  { id: "uba_01JX6XT6X8K7Q3Z5Y2R4M9B1A", name: "United Bank for Africa" },
  { id: "fbn_01JX6XT6X8K7Q3Z5Y2R4M9B2B", name: "First Bank of Nigeria" },
];

const schema = z.object({
  name: z.string().nonempty("Name is required"),
  settlementBankAccountId: z.string().nonempty("Bank account ID is required"),
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
    defaultValues: { name: "", settlementBankAccountId: "" },
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

  const handleCreate = form.handleSubmit(async ({ name, settlementBankAccountId }) => {
    try {
      await createSubaccount({ name, settlementBankAccountId });
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
        <FormField label="Settlement Bank" error={form.formState.errors.settlementBankAccountId?.message} isRequired>
          <Select
            value={form.watch("settlementBankAccountId")}
            onValueChange={(v) => form.setValue("settlementBankAccountId", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a bank" />
            </SelectTrigger>
            <SelectContent>
              {BANKS.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.name}
                </SelectItem>
              ))}
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
