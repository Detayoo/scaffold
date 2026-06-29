"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Send,
  CheckCheck,
  AlertTriangle,
} from "lucide-react";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { getAdminRefundsFn, approveAdminRefundFn, rejectAdminRefundFn, processAdminRefundFn, markAdminRefundSucceededFn, markAdminRefundFailedFn } from "@/services";
import { formatMoney, toastMessage, extractError } from "@/utils";

interface AdminRefundDetailSheetProps {
  refundId: string | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AdminRefundDetailSheet({ refundId, onOpenChange, onSuccess }: AdminRefundDetailSheetProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin-refund-detail", refundId],
    queryFn: () => getAdminRefundsFn({ reference: refundId ?? undefined }),
    enabled: !!refundId,
  });

  const refund = data?.data?.[0];

  const { mutateAsync: approve, isPending: approving } = useMutation({
    mutationFn: approveAdminRefundFn,
    onSuccess: () => { toastMessage("success", "Refund approved"); setConfirmAction(null); refetch(); onSuccess?.(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: reject, isPending: rejecting } = useMutation({
    mutationFn: rejectAdminRefundFn,
    onSuccess: () => { toastMessage("success", "Refund rejected"); setConfirmAction(null); refetch(); onSuccess?.(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: process, isPending: processing } = useMutation({
    mutationFn: processAdminRefundFn,
    onSuccess: () => { toastMessage("success", "Refund processing started"); setConfirmAction(null); refetch(); onSuccess?.(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: markSuccess, isPending: markingSuccess } = useMutation({
    mutationFn: markAdminRefundSucceededFn,
    onSuccess: () => { toastMessage("success", "Refund marked as succeeded"); setConfirmAction(null); refetch(); onSuccess?.(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: markFailed, isPending: markingFailed } = useMutation({
    mutationFn: markAdminRefundFailedFn,
    onSuccess: () => { toastMessage("success", "Refund marked as failed"); setConfirmAction(null); refetch(); onSuccess?.(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleConfirm = async () => {
    if (!refund?.id) return;
    try {
      switch (confirmAction) {
        case "approve":
          await approve({ id: refund.id });
          break;
        case "reject":
          await reject({ id: refund.id, reason: "Rejected by admin" });
          break;
        case "process":
          await process({ id: refund.id, executionMode: "manual", provider: "VPS" });
          break;
        case "mark-success":
          await markSuccess({ id: refund.id, providerReference: `rf_admin_${Date.now()}`, succeededAt: new Date().toISOString() });
          break;
        case "mark-failed":
          await markFailed({ id: refund.id, reason: "Processing failed" });
          break;
      }
    } catch {}
  };

  const status = refund?.status?.toLowerCase();

  return (
    <>
      <ResponsiveSheet
        open={!!refundId}
        onOpenChange={(o) => { if (!o) onOpenChange(false); }}
        title="Refund Details"
      >
        <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load refund details.">
          {refund ? (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="text-sm text-foreground">{refund?.reference}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm text-foreground">{formatMoney(refund?.amountMinor)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={refund?.status ?? ""} size="sm" />
              </div>
              {refund?.reason && (
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="text-sm text-foreground">{refund?.reason}</p>
                </div>
              )}

              {status && ["requested", "approved", "processing"].includes(status) && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    {status === "requested" && (
                      <>
                        <Button className="gap-2 w-full" onClick={() => setConfirmAction("approve")} disabled={approving}>
                          <CheckCircle2 className="size-4" /> Approve
                        </Button>
                        <Button variant="outline" className="gap-2 w-full" onClick={() => setConfirmAction("reject")} disabled={rejecting}>
                          <XCircle className="size-4" /> Reject
                        </Button>
                      </>
                    )}
                    {status === "approved" && (
                      <Button className="gap-2 w-full" onClick={() => setConfirmAction("process")} disabled={processing}>
                        <Send className="size-4" /> Start Processing
                      </Button>
                    )}
                    {status === "processing" && (
                      <>
                        <Button className="gap-2 w-full" onClick={() => setConfirmAction("mark-success")} disabled={markingSuccess}>
                          <CheckCheck className="size-4" /> Mark Succeeded
                        </Button>
                        <Button variant="destructive" className="gap-2 w-full" onClick={() => setConfirmAction("mark-failed")} disabled={markingFailed}>
                          <AlertTriangle className="size-4" /> Mark Failed
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </AsyncContent>
      </ResponsiveSheet>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(o) => { if (!o) setConfirmAction(null); }}
        title={
          confirmAction === "approve" ? "Approve Refund" :
          confirmAction === "reject" ? "Reject Refund" :
          confirmAction === "process" ? "Start Processing" :
          confirmAction === "mark-success" ? "Mark as Succeeded" :
          "Mark as Failed"
        }
        description={
          confirmAction === "approve" ? "Are you sure you want to approve this refund?" :
          confirmAction === "reject" ? "This will reject the refund request." :
          confirmAction === "process" ? "Start provider or manual processing for this refund?" :
          confirmAction === "mark-success" ? "Finalize this refund and post reversal ledger entries?" :
          "Mark this processing refund as failed?"
        }
        confirmLabel={
          confirmAction === "approve" ? "Approve" :
          confirmAction === "reject" ? "Reject" :
          confirmAction === "process" ? "Start Processing" :
          confirmAction === "mark-success" ? "Mark Succeeded" :
          "Mark Failed"
        }
        variant={confirmAction === "reject" || confirmAction === "mark-failed" ? "destructive" : "default"}
        onConfirm={handleConfirm}
        loading={approving || rejecting || processing || markingSuccess || markingFailed}
      />
    </>
  );
}
