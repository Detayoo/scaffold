"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/FormField";
import { BankSelectField } from "@/components/BankSelectField";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { createSubaccountFn, resolveBankAccountFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const schema = z.object({
  name: z.string().nonempty("Name is required"),
  bankCode: z.string().nonempty("Bank code is required"),
  accountNumber: z.string().nonempty("Account number is required").length(10, "Account number must be 10 digits"),
  percentage: z.string().nonempty("Percentage is required").refine((v) => {
    const n = Number(v);
    return !isNaN(n) && n > 0 && n <= 100;
  }, "Must be between 1 and 100"),
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
    defaultValues: { name: "", bankCode: "", accountNumber: "", percentage: "" },
  });

  const bankCode = form.watch("bankCode");
  const accountNumber = form.watch("accountNumber");
  const canResolve = !!bankCode && accountNumber?.length === 10;

  const { data: resolvedData, isFetching: resolving, isError: resolveError } = useQuery({
    queryKey: ["resolve-bank", bankCode, accountNumber],
    queryFn: () => resolveBankAccountFn({ bankCode, accountNumber }),
    enabled: canResolve,
    retry: false,
  });

  const resolved = resolvedData?.data;
  const verified = resolved?.verified === true;

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

  const handleCreate = form.handleSubmit(async ({ name, bankCode, accountNumber, percentage }) => {
    try {
      const pct = Number(percentage);
      await createSubaccount({
        name,
        bankCode,
        accountNumber,
        split: {
          percentageBps: Math.round(pct * 100),
          platformPercentageBps: Math.round((100 - pct) * 100),
        },
      });
    } catch {}
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
          <Input {...form.register("name")} placeholder="e.g. Balogun Rice Seller" />
        </FormField>
        <BankSelectField
          value={bankCode}
          onValueChange={(v) => form.setValue("bankCode", v)}
          label="Bank"
          isRequired
          error={form.formState.errors.bankCode?.message}
        />
        <FormField label="Account Number" error={form.formState.errors.accountNumber?.message} isRequired>
          <Input {...form.register("accountNumber")} placeholder="0123456789" maxLength={10} />
        </FormField>

        {resolving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Resolving account...
          </div>
        )}
        {resolved && verified && (
          <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-3 py-2 text-sm">
            <span className="text-foreground font-medium">{resolved.accountName}</span>
          </div>
        )}
        {resolveError && canResolve && !resolving && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <XCircle className="size-4 shrink-0" />
            Could not resolve account
          </div>
        )}

        <FormField label="Your Share (%)" error={form.formState.errors.percentage?.message} isRequired>
          <Input {...form.register("percentage")} type="number" placeholder="e.g. 90" />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>Cancel</Button>
          <Button type="submit" disabled={creating || (canResolve && !verified)}>
            {creating ? "Creating..." : "Create Subaccount"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
