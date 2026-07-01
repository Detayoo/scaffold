"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/DataTable";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { getPaylinkPaymentsFn, updatePaylinkStatusFn } from "@/services";
import { toastMessage, extractError, formatMoney, formatDate } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useState } from "react";

function PaylinkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const copy = useCopyToClipboard();
  const [confirmAction, setConfirmAction] = useState<"active" | "inactive" | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["paylink-detail", id],
    queryFn: () => getPaylinkPaymentsFn({ id }),
    enabled: !!id,
  });

  const paylink = data?.data?.paylink;
  const payments = data?.data?.payments ?? [];

  const { mutateAsync: updateStatus, isPending: updating } = useMutation({
    mutationFn: updatePaylinkStatusFn,
    onSuccess: () => {
      toastMessage("success", confirmAction === "inactive" ? "Link deactivated" : "Link activated");
      setConfirmAction(null);
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleCopyUrl = async (text: string) => {
    const ok = await copy(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const columns: Column<any>[] = [
    { key: "reference", header: "Reference", cell: (p) => <span className="text-sm text-foreground">{p?.reference}</span> },
    { key: "amount_minor", header: "Amount", cell: (p) => <span className="text-sm text-foreground">{p?.amount_minor ? formatMoney(p.amount_minor) : "—"}</span> },
    { key: "currency", header: "Currency", cell: (p) => <span className="text-sm text-foreground">{p?.currency ?? "—"}</span> },
    { key: "channels", header: "Channels", cell: (p) => <span className="text-sm capitalize text-foreground">{p?.channels?.join(", ").replace(/_/g, " ") ?? "—"}</span> },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p?.status} size="sm" /> },
    { key: "created_at", header: "Date", cell: (p) => <span className="text-xs text-foreground">{p?.created_at ? formatDate(p.created_at) : "—"}</span> },
  ];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="size-4" />
        Back to Payment Links
      </button>

      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load payment link details">
        {paylink && (
          <>
            <div className="rounded-lg border bg-background p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="text-lg font-semibold text-foreground">{paylink?.reference}</p>
                </div>
                <StatusBadge status={paylink?.status} size="md" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-sm font-medium text-foreground">{paylink?.amountMinor ? formatMoney(paylink.amountMinor) : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Currency</p>
                  <p className="text-sm text-foreground">{paylink?.currency ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Channels</p>
                  <p className="text-sm capitalize text-foreground">{paylink?.channels?.join(", ").replace(/_/g, " ") ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={paylink?.status} size="sm" />
                </div>
              </div>
              {paylink?.paymentLink && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment Link URL</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border bg-muted px-3 py-2 text-xs break-all">{paylink.paymentLink}</code>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(paylink.paymentLink)}
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    >
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {paylink?.status === "active" ? (
                  <Button variant="outline" className="text-destructive" onClick={() => setConfirmAction("inactive")}>
                    Deactivate Link
                  </Button>
                ) : (
                  <Button variant="default" onClick={() => setConfirmAction("active")}>
                    Activate Link
                  </Button>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold mb-4">Payments ({payments?.length ?? 0})</h2>
              <DataTable
                columns={columns}
                data={payments}
                isPending={false}
                isError={false}
                emptyTitle="No payments yet"
                emptyDescription="This payment link hasn't received any payments."
              />
            </div>
          </>
        )}
      </AsyncContent>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(o) => { if (!o) setConfirmAction(null); }}
        title={confirmAction === "inactive" ? "Deactivate Link" : "Activate Link"}
        description={`Are you sure you want to ${confirmAction === "inactive" ? "deactivate" : "activate"} this payment link?`}
        confirmLabel={confirmAction === "inactive" ? "Deactivate" : "Activate"}
        variant={confirmAction === "inactive" ? "destructive" : "default"}
        onConfirm={async () => { try { if (confirmAction && id) await updateStatus({ id, status: confirmAction }); } catch {} }}
        loading={updating}
      />
    </div>
  );
}

export default withSuspense(PaylinkDetailPage);
