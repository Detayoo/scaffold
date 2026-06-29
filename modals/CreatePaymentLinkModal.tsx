"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Copy, Check } from "lucide-react";
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
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

const createSchema = z.object({
  reference: z.string().nonempty("Reference is required"),
  amount: z.string().nonempty("Amount is required"),
  currency: z.string().nonempty("Currency is required"),
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
  const [newLink, setNewLink] = useState<{ url: string; reference: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const copy = useCopyToClipboard();

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { reference: "", amount: "", currency: "NGN", cardChannel: true, transferChannel: false },
  });

  const cardChannel = form.watch("cardChannel");
  const transferChannel = form.watch("transferChannel");

  const { mutateAsync: createPaylink, isPending: creating } = useMutation({
    mutationFn: createPaylinkFn,
    onSuccess: (res) => {
      toastMessage("success", "Payment link created");
      setNewLink({ url: res?.data?.payUrl ?? "#", reference: res?.data?.reference ?? "" });
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCreate = form.handleSubmit(async ({ reference, amount, currency, cardChannel, transferChannel }) => {
    const channels: string[] = [];
    if (cardChannel) channels.push("card");
    if (transferChannel) channels.push("bank_transfer");
    await createPaylink({ reference, amount: Math.round(parseFloat(amount) * 100), currency, channels });
  });

  const handleCopy = async (text: string) => {
    const ok = await copy(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o && !creating && !newLink) { onOpenChange(false); form.reset(); } if (!o && newLink) { onOpenChange(false); setNewLink(null); form.reset(); } }}
      title="Create Payment Link"
      description="Generate a new shareable payment link"
    >
      {newLink ? (
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">Your payment link has been created!</p>
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <p className="text-xs text-muted-foreground">Reference</p>
            <p className="text-sm font-medium">{newLink.reference}</p>
            <p className="text-xs text-muted-foreground">URL</p>
            <div className="flex items-center gap-2">
              <Input value={newLink.url} readOnly className="text-sm" />
              <button
                type="button"
                onClick={() => handleCopy(newLink.url)}
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setNewLink(null)}>
            Create Another
          </Button>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <FormField label="Reference" error={form.formState.errors.reference?.message} isRequired>
            <Input {...form.register("reference")} placeholder="pl_my_unique_ref" />
          </FormField>
          <FormField label="Amount (NGN)" error={form.formState.errors.amount?.message} isRequired>
            <Input {...form.register("amount")} type="number" placeholder="10000" />
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
      )}
    </ResponsiveModal>
  );
}
