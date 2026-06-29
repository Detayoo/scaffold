"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Plus, Copy, Check } from "lucide-react";
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
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { PaymentLinkDetailSheet } from "@/components/PaymentLinkDetailSheet";
import { getPaylinksFn, createPaylinkFn, updatePaylinkStatusFn } from "@/services";
import { toastMessage, extractError, formatMoney } from "@/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { withSuspense } from "@/components/withSuspense";

const createSchema = z.object({
  reference: z.string().nonempty("Reference is required"),
  amount: z.string().nonempty("Amount is required"),
  currency: z.string().nonempty("Currency is required"),
});

type CreateForm = z.infer<typeof createSchema>;

function PaylinksContent() {
  const queryClient = useQueryClient();
  const copy = useCopyToClipboard();
  const [copied, setCopied] = useState("");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
  const [size, setSize] = useQueryState("size", parseAsInteger.withDefault(10));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"active" | "inactive">("active");
  const [newLink, setNewLink] = useState<{ url: string; reference: string } | null>(null);
  const [detailRef, setDetailRef] = useState<string | null>(null);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["paylinks", page, size, statusFilter, search],
    queryFn: () => getPaylinksFn({ reference: search || undefined, status: statusFilter || undefined }),
  });

  const paylinks = data?.data;

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { reference: "", amount: "", currency: "NGN" },
  });

  const { mutateAsync: createPaylink, isPending: creating } = useMutation({
    mutationFn: createPaylinkFn,
    onSuccess: (res) => {
      toastMessage("success", "Payment link created");
      setCreateOpen(false);
      createForm.reset();
      setNewLink({ url: res?.data?.payUrl ?? "#", reference: res?.data?.reference ?? "" });
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: updateStatus, isPending: updating } = useMutation({
    mutationFn: updatePaylinkStatusFn,
    onSuccess: () => {
      toastMessage("success", confirmAction === "active" ? "Link deactivated" : "Link activated");
      setConfirmId(null);
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCreate = createForm.handleSubmit(async ({ reference, amount, currency }) => {
    await createPaylink({
      reference,
      amountMinor: Math.round(parseFloat(amount) * 100),
      currency,
    });
  });

  const handleCopy = async (text: string, key: string) => {
    const ok = await copy(text);
    if (ok) { setCopied(key); setTimeout(() => setCopied(""), 2000); }
  };

  const columns: Column<any>[] = [
    {
      key: "reference",
      header: "Reference",
      cell: (pl) => <span className="text-sm text-foreground">{pl?.reference}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (pl) => <span className="text-sm text-foreground">{formatMoney(pl?.amountMinor)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (pl) => <StatusBadge status={pl?.status} size="sm" />,
    },
    {
      key: "url",
      header: "URL",
      cell: (pl) => (
        <div className="flex items-center gap-1 max-w-[200px]">
          <span className="text-sm text-foreground truncate">{pl?.payUrl}</span>
          <button
            type="button"
            onClick={() => handleCopy(pl?.payUrl ?? "", pl?.id)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {copied === pl?.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      cell: (pl) => (
        pl?.status === "active" ? (
          <button
            type="button"
            onClick={() => { setConfirmId(pl?.id); setConfirmAction("inactive"); }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            Deactivate
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setConfirmId(pl?.id); setConfirmAction("active"); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Activate
          </button>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Links" description="Create and manage shareable payment links" />

      <DataTable
        columns={columns}
        data={paylinks}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        emptyTitle="No payment links yet"
        emptyDescription="Create your first payment link to start collecting payments."
        emptyAction={{ label: "Create Link", onClick: () => setCreateOpen(true) }}
        onRowClick={(pl) => setDetailRef(pl?.reference)}
      />

      <PaymentLinkDetailSheet reference={detailRef} onOpenChange={(o) => { if (!o) setDetailRef(null); }} />

      <ResponsiveModal
        open={createOpen}
        onOpenChange={setCreateOpen}
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
                  onClick={() => handleCopy(newLink.url, "new")}
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                >
                  {copied === "new" ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setNewLink(null)}>
              Create Another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <FormField label="Reference" error={createForm.formState.errors.reference?.message} isRequired>
              <Input {...createForm.register("reference")} placeholder="pl_my_unique_ref" />
            </FormField>
            <FormField label="Amount (NGN)" error={createForm.formState.errors.amount?.message} isRequired>
              <Input {...createForm.register("amount")} type="number" placeholder="10000" />
            </FormField>
            <FormField label="Currency" isRequired>
              <Select
                value={createForm.watch("currency")}
                onValueChange={(v) => createForm.setValue("currency", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Link"}</Button>
            </div>
          </form>
        )}
      </ResponsiveModal>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => { if (!o) setConfirmId(null); }}
        title={confirmAction === "inactive" ? "Deactivate Link" : "Activate Link"}
        description={`Are you sure you want to ${confirmAction === "inactive" ? "deactivate" : "activate"} this payment link?`}
        confirmLabel={confirmAction === "inactive" ? "Deactivate" : "Activate"}
        variant={confirmAction === "inactive" ? "destructive" : "default"}
        onConfirm={() => confirmId && updateStatus({ id: confirmId, status: confirmAction })}
        loading={updating}
      />
    </div>
  );
}

export default withSuspense(PaylinksContent);
