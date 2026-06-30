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
import { assignCustomerDvaFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const schema = z.object({
  accountNumber: z.string().nonempty("Account number is required"),
  accountName: z.string().nonempty("Account name is required"),
  bankName: z.string().nonempty("Bank name is required"),
  accountType: z.string().nonempty("Account type is required"),
  provider: z.string().optional(),
  currency: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AssignDvaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  onSuccess?: () => void;
}

export function AssignDvaModal({ open, onOpenChange, customerId, onSuccess }: AssignDvaModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { accountNumber: "", accountName: "", bankName: "", accountType: "customer_dedicated", provider: "VPS", currency: "NGN" },
  });

  const { mutateAsync: assignDva, isPending: assigning } = useMutation({
    mutationFn: assignCustomerDvaFn,
    onSuccess: () => {
      toastMessage("success", "Dedicated account assigned");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleAssign = form.handleSubmit(async (data) => {
    try {
      await assignDva({
        id: customerId,
        payload: {
          accountNumber: data.accountNumber,
          accountName: data.accountName,
          bankName: data.bankName,
          accountType: data.accountType,
          provider: data.provider ?? "VPS",
          currency: data.currency ?? "NGN",
        },
      });
    } catch {
      // handled by onError
    }
  });

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o && !assigning) { onOpenChange(false); form.reset(); } }}
      title="Assign Dedicated Account"
      description="Link a virtual account to this customer"
    >
      <form onSubmit={handleAssign} className="space-y-4 pt-2">
        <FormField label="Account Number" error={form.formState.errors.accountNumber?.message} isRequired>
          <Input {...form.register("accountNumber")} placeholder="7701234567" />
        </FormField>
        <FormField label="Account Name" error={form.formState.errors.accountName?.message} isRequired>
          <Input {...form.register("accountName")} placeholder="CHINEDU OKAFOR" />
        </FormField>
        <FormField label="Bank Name" error={form.formState.errors.bankName?.message} isRequired>
          <Input {...form.register("bankName")} placeholder="VPS Dedicated Bank" />
        </FormField>
        <FormField label="Account Type" error={form.formState.errors.accountType?.message} isRequired>
          <Select
            value={form.watch("accountType")}
            onValueChange={(v) => form.setValue("accountType", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer_dedicated">Customer Dedicated</SelectItem>
              <SelectItem value="merchant_dedicated">Merchant Dedicated</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Provider" error={form.formState.errors.provider?.message}>
          <Select
            value={form.watch("provider")}
            onValueChange={(v) => form.setValue("provider", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INTERSWITCH">INTERSWITCH</SelectItem>
              <SelectItem value="VPS">VPS</SelectItem>
              <SelectItem value="MPGS">MPGS</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Currency" error={form.formState.errors.currency?.message}>
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
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={assigning}>Cancel</Button>
          <Button type="submit" disabled={assigning}>{assigning ? "Assigning..." : "Assign Account"}</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
