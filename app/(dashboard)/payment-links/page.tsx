"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Plus, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { PaymentLinkDetailSheet } from "@/modals/PaymentLinkDetailSheet";
import { CreatePaymentLinkModal } from "@/modals/CreatePaymentLinkModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { getPaylinksFn, updatePaylinkStatusFn } from "@/services";
import { toastMessage, extractError, formatMoney } from "@/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { withSuspense } from "@/components/withSuspense";

function PaylinksContent() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
  const [size, setSize] = useQueryState("size", parseAsInteger.withDefault(10));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"active" | "inactive">("active");
  const [detailRef, setDetailRef] = useState<string | null>(null);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["paylinks", page, size, statusFilter, search],
    queryFn: () => getPaylinksFn({ reference: search || undefined, status: statusFilter || undefined }),
  });

  const paylinks = data?.data;
  const copy = useCopyToClipboard();
  const [copied, setCopied] = useState("");

  const { mutateAsync: updateStatus, isPending: updating } = useMutation({
    mutationFn: updatePaylinkStatusFn,
    onSuccess: () => {
      toastMessage("success", confirmAction === "active" ? "Link deactivated" : "Link activated");
      setConfirmId(null);
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
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

      <div className="flex items-center justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Create Payment Link
        </Button>
      </div>

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

      <CreatePaymentLinkModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={() => refetch()} />
      <PaymentLinkDetailSheet reference={detailRef} onOpenChange={(o) => { if (!o) setDetailRef(null); }} />

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
