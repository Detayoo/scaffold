"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
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
import { SearchableSelect } from "@/components/SearchableSelect";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { getSubaccountsFn, createSplitRuleFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const recipientSchema = z.object({
  subaccountId: z.string().nonempty("Subaccount is required"),
  role: z.string().optional(),
  percentageBps: z.string().optional(),
  flatAmountMinor: z.string().optional(),
  feeBearer: z.string().optional(),
  metadata: z.string().optional(),
});

const schema = z.object({
  name: z.string().nonempty("Name is required"),
  ruleType: z.string().nonempty("Rule type is required"),
  basis: z.string().nonempty("Basis is required"),
  feeBearer: z.string().nonempty("Fee bearer is required"),
  liabilityMode: z.string().optional(),
  environment: z.string().optional(),
  recipients: z.array(recipientSchema).min(1, "At least one recipient is required"),
  remainderRecipientSubaccountId: z.string().optional(),
  metadata: z.string().optional(),
});

type SplitRuleFormData = z.infer<typeof schema>;

interface CreateSplitRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSplitRuleModal({ open, onOpenChange, onSuccess }: CreateSplitRuleModalProps) {
  const { data: subaccountsData } = useQuery({
    queryKey: ["subaccounts"],
    queryFn: () => getSubaccountsFn(),
  });

  const subaccounts = subaccountsData?.data;

  const form = useForm<SplitRuleFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      ruleType: "percentage",
      basis: "net",
      feeBearer: "merchant",
      liabilityMode: "proportional",
      environment: "test",
      recipients: [{ subaccountId: "", role: "seller", percentageBps: "", flatAmountMinor: "", feeBearer: "recipient", metadata: "" }],
      remainderRecipientSubaccountId: "",
      metadata: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "recipients" });

  const { mutateAsync: createRule, isPending: creating } = useMutation({
    mutationFn: createSplitRuleFn,
    onSuccess: () => {
      toastMessage("success", "Split rule created");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCreate = form.handleSubmit(async (data) => {
    try {
      await createRule({
        name: data.name,
        ruleType: data.ruleType as "percentage" | "flat" | "hybrid",
        basis: data.basis as "net" | "gross",
        feeBearer: data.feeBearer as "customer" | "merchant",
        liabilityMode: data.liabilityMode || undefined,
        environment: data.environment || undefined,
        recipients: data.recipients.map((r) => ({
          subaccountId: r.subaccountId,
          role: r.role || undefined,
          percentageBps: r.percentageBps ? Number(r.percentageBps) : 0,
          flatAmountMinor: r.flatAmountMinor ? Number(r.flatAmountMinor) : 0,
          feeBearer: (r.feeBearer as "customer" | "merchant" | "recipient") || undefined,
          metadata: r.metadata ? { [r.metadata.split(":")[0]]: r.metadata.split(":").slice(1).join(":") } : undefined,
        })),
        remainderRecipientSubaccountId: data.remainderRecipientSubaccountId || undefined,
        metadata: data.metadata ? { market: data.metadata } : undefined,
      });
    } catch {}
  });

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(o) => { if (!o && !creating) { onOpenChange(false); form.reset(); } }}
      title="Create Split Rule"
      description="Define how payments are split between recipients"
    >
      <form onSubmit={handleCreate} className="space-y-4">
        <FormField label="Name" error={form.formState.errors.name?.message} isRequired>
          <Input {...form.register("name")} placeholder="Alausa marketplace 90/10" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Rule Type" error={form.formState.errors.ruleType?.message} isRequired>
            <Select
              value={form.watch("ruleType")}
              onValueChange={(v) => form.setValue("ruleType", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Basis" error={form.formState.errors.basis?.message} isRequired>
            <Select
              value={form.watch("basis")}
              onValueChange={(v) => form.setValue("basis", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net">Net (after fees)</SelectItem>
                <SelectItem value="gross">Gross (before fees)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Fee Bearer" error={form.formState.errors.feeBearer?.message} isRequired>
            <Select
              value={form.watch("feeBearer")}
              onValueChange={(v) => form.setValue("feeBearer", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merchant">Merchant</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Liability Mode" error={form.formState.errors.liabilityMode?.message}>
            <Select
              value={form.watch("liabilityMode")}
              onValueChange={(v) => form.setValue("liabilityMode", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proportional">Proportional</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Environment">
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
          <FormField label="Metadata (optional)">
            <Input {...form.register("metadata")} placeholder="e.g. market:Alausa" />
          </FormField>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-3">Recipients</p>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border bg-muted/30 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Recipient {index + 1}</p>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <FormField
                  label="Subaccount"
                  error={form.formState.errors.recipients?.[index]?.subaccountId?.message}
                  isRequired
                >
                  <SearchableSelect
                    options={subaccounts?.map((sa: any) => ({ value: sa.id, label: sa.name })) ?? []}
                    value={form.watch(`recipients.${index}.subaccountId`)}
                    onValueChange={(v) => form.setValue(`recipients.${index}.subaccountId`, v)}
                    placeholder="Select subaccount"
                    searchPlaceholder="Search subaccounts..."
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Role">
                    <Select
                      value={form.watch(`recipients.${index}.role`)}
                      onValueChange={(v) => form.setValue(`recipients.${index}.role`, v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="marketplace">Marketplace</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Fee Bearer">
                    <Select
                      value={form.watch(`recipients.${index}.feeBearer`)}
                      onValueChange={(v) => form.setValue(`recipients.${index}.feeBearer`, v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recipient">Recipient</SelectItem>
                        <SelectItem value="merchant">Merchant</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="Percentage (bps)"
                    error={form.formState.errors.recipients?.[index]?.percentageBps?.message}
                  >
                    <Input
                      type="number"
                      {...form.register(`recipients.${index}.percentageBps`)}
                      placeholder="9000"
                    />
                  </FormField>
                  <FormField
                    label="Flat Amount (kobo)"
                    error={form.formState.errors.recipients?.[index]?.flatAmountMinor?.message}
                  >
                    <Input
                      type="number"
                      {...form.register(`recipients.${index}.flatAmountMinor`)}
                      placeholder="0"
                    />
                  </FormField>
                </div>
                <FormField label="Recipient Metadata (optional)">
                  <Input {...form.register(`recipients.${index}.metadata`)} placeholder="e.g. stall:Alausa B12" />
                </FormField>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 gap-2"
            onClick={() => append({ subaccountId: "", role: "seller", percentageBps: "", flatAmountMinor: "", feeBearer: "recipient", metadata: "" })}
          >
            <Plus className="size-4" />
            Add Recipient
          </Button>
          {form.formState.errors.recipients?.message && (
            <p className="text-xs text-destructive mt-1">{form.formState.errors.recipients.message}</p>
          )}
        </div>

        <FormField label="Remainder Recipient (optional)" error={form.formState.errors.remainderRecipientSubaccountId?.message}>
          <SearchableSelect
            options={subaccounts?.map((sa: any) => ({ value: sa.id, label: sa.name })) ?? []}
            value={form.watch("remainderRecipientSubaccountId")}
            onValueChange={(v) => form.setValue("remainderRecipientSubaccountId", v)}
            placeholder="Select subaccount"
            searchPlaceholder="Search subaccounts..."
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>Cancel</Button>
          <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Split Rule"}</Button>
        </div>
      </form>
    </ResponsiveSheet>
  );
}
