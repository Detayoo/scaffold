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
import { updateAdminMerchantChargeFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const schema = z.object({
  environment: z.string().nonempty("Environment is required"),
  channel: z.string().nonempty("Channel is required"),
  currency: z.string().nonempty("Currency is required"),
  feeBearer: z.string().nonempty("Fee bearer is required"),
  percentageBps: z.string().nonempty("Percentage is required"),
  fixedAmountMinor: z.string().nonempty("Fixed amount is required"),
  floorAmountMinor: z.string().optional(),
  capAmountMinor: z.string().optional(),
});

type ChargeForm = z.infer<typeof schema>;

interface ChargePolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId: string;
  onSuccess?: () => void;
}

export function ChargePolicyModal({ open, onOpenChange, merchantId, onSuccess }: ChargePolicyModalProps) {
  const form = useForm<ChargeForm>({
    resolver: zodResolver(schema),
    defaultValues: { environment: "test", channel: "card", currency: "NGN", feeBearer: "merchant", percentageBps: "", fixedAmountMinor: "", floorAmountMinor: "", capAmountMinor: "" },
  });

  const { mutateAsync: updateCharge, isPending: updating } = useMutation({
    mutationFn: updateAdminMerchantChargeFn,
    onSuccess: () => {
      toastMessage("success", "Charge policy updated");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await updateCharge({
        id: merchantId,
        payload: {
          environment: data.environment,
          channel: data.channel,
          currency: data.currency,
          feeBearer: data.feeBearer,
          percentageBps: Number(data.percentageBps),
          fixedAmountMinor: Number(data.fixedAmountMinor),
          floorAmountMinor: data.floorAmountMinor ? Number(data.floorAmountMinor) : undefined,
          capAmountMinor: data.capAmountMinor ? Number(data.capAmountMinor) : undefined,
        },
      });
    } catch {}
  });

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Charge Policy" description="Create or update a merchant charge policy">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Environment" error={form.formState.errors.environment?.message} isRequired>
            <Select value={form.watch("environment")} onValueChange={(v) => form.setValue("environment", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Channel" error={form.formState.errors.channel?.message} isRequired>
            <Select value={form.watch("channel")} onValueChange={(v) => form.setValue("channel", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Currency" error={form.formState.errors.currency?.message} isRequired>
            <Select value={form.watch("currency")} onValueChange={(v) => form.setValue("currency", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Fee Bearer" error={form.formState.errors.feeBearer?.message} isRequired>
            <Select value={form.watch("feeBearer")} onValueChange={(v) => form.setValue("feeBearer", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="merchant">Merchant</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Percentage (bps)" error={form.formState.errors.percentageBps?.message} isRequired>
            <Input {...form.register("percentageBps")} type="number" placeholder="150" />
          </FormField>
          <FormField label="Fixed Amount (kobo)" error={form.formState.errors.fixedAmountMinor?.message} isRequired>
            <Input {...form.register("fixedAmountMinor")} type="number" placeholder="10000" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Floor (kobo)">
            <Input {...form.register("floorAmountMinor")} type="number" placeholder="0" />
          </FormField>
          <FormField label="Cap (kobo)">
            <Input {...form.register("capAmountMinor")} type="number" placeholder="200000" />
          </FormField>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={updating}>Cancel</Button>
          <Button type="submit" disabled={updating}>{updating ? "Saving..." : "Save Charge"}</Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
