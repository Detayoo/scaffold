"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Send,
  CheckCheck,
  AlertTriangle,
} from "lucide-react";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { approveAdminRefundFn, rejectAdminRefundFn, processAdminRefundFn, markAdminRefundSucceededFn, markAdminRefundFailedFn } from "@/services";
import { formatMoney, formatDate, toastMessage, extractError } from "@/utils";
import type { Refund } from "@/types";

interface AdminRefundDetailSheetProps {
  refund: Refund | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AdminRefundDetailSheet({ refund, onOpenChange, onSuccess }: AdminRefundDetailSheetProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const { mutateAsync: approve, isPending: approving } = useMutation({
    mutationFn: approveAdminRefundFn,
    onSuccess: () => { toastMessage("success", "Refund approved"); setConfirmAction(null); onOpenChange(false); onSuccess?.(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: reject, isPending: rejecting } = useMutation({
    mutationFn: rejectAdminRefundFn,
    onSuccess: () => { toastMessage("success", "Refund rejected"); setConfirmAction(null); refetchParent(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: process, isPending: processing } = useMutation({
    mutationFn: processAdminRefundFn,
    onSuccess: () => { toastMessage("success", "Refund processing started"); setConfirmAction(null); refetchParent(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: markSuccess, isPending: markingSuccess } = useMutation({
    mutationFn: markAdminRefundSucceededFn,
    onSuccess: () => { toastMessage("success", "Refund marked as succeeded"); setConfirmAction(null); refetchParent(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: markFailed, isPending: markingFailed } = useMutation({
    mutationFn: markAdminRefundFailedFn,
    onSuccess: () => { toastMessage("success", "Refund marked as failed"); setConfirmAction(null); refetchParent(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  function refetchParent() {
    onSuccess?.();
  }

  const handleConfirm = async () => {
    if (!refund?.id) return;
    try {
      switch (confirmAction) {
        case "approve":
          await approve({ id: refund.id, reason: "Approved by admin", evidence: { operator: "Admin" } });
          break;
        case "reject":
          await reject({ id: refund.id, reason: "Rejected by admin" });
          break;
        case "process":
          await process({ id: refund.id, executionMode: "manual", providerReference: `rf_admin_${Date.now()}`, evidence: { destination_bank: "N/A", destination_account: "N/A" } });
          break;
        case "mark-success":
          await markSuccess({ id: refund.id, evidence: { bank: "N/A", nibss_reference: `NIP/ADM/${Date.now()}`, paid_to: "Customer" } });
          break;
        case "mark-failed":
          await markFailed({ id: refund.id, reason: "Processing failed", evidence: { bank_response: "Processing error" } });
          break;
      }
    } catch {}
  };

  const status = refund?.status?.toLowerCase();

  return (
    <>
      <ResponsiveSheet
        open={!!refund}
        onOpenChange={(o) => { if (!o) onOpenChange(false); }}
        title="Refund Details"
      >
        {refund ? (
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Reference</p>
              <p className="text-sm text-foreground">{refund?.reference}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={refund?.status ?? ""} size="sm" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm text-foreground">{refund?.currency ?? "NGN"} {formatMoney(refund?.amountMinor)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Currency</p>
              <p className="text-sm text-foreground">{refund?.currency ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Environment</p>
              <p className="text-sm text-foreground capitalize">{refund?.environment ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Execution Mode</p>
              <p className="text-sm text-foreground capitalize">{refund?.executionMode?.replace(/_/g, " ") ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fee Policy</p>
              <p className="text-sm text-foreground">{refund?.feePolicy?.replace(/_/g, " ") ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fee Refund Amount</p>
              <p className="text-sm text-foreground">{formatMoney(refund?.feeRefundAmountMinor)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Merchant Debit Amount</p>
              <p className="text-sm text-foreground">{formatMoney(refund?.merchantDebitAmountMinor)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Requires Manual Funding</p>
              <p className="text-sm text-foreground">{refund?.requiresManualFunding ? "Yes" : "No"}</p>
            </div>
            {refund?.reason && (
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm text-foreground">{refund?.reason}</p>
              </div>
            )}
            {refund?.rejectionReason && (
              <div>
                <p className="text-xs text-muted-foreground">Rejection Reason</p>
                <p className="text-sm text-foreground">{refund?.rejectionReason}</p>
              </div>
            )}

            <Separator />
            <p className="text-xs font-medium text-muted-foreground">Timeline</p>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm text-foreground">{refund?.createdAt ? formatDate(refund.createdAt) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Updated</p>
              <p className="text-sm text-foreground">{refund?.updatedAt ? formatDate(refund.updatedAt) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="text-sm text-foreground">{refund?.approvedAt ? formatDate(refund.approvedAt) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="text-sm text-foreground">{refund?.rejectedAt ? formatDate(refund.rejectedAt) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Processed</p>
              <p className="text-sm text-foreground">{refund?.processedAt ? formatDate(refund.processedAt) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Succeeded</p>
              <p className="text-sm text-foreground">{refund?.succeededAt ? formatDate(refund.succeededAt) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="text-sm text-foreground">{refund?.failedAt ? formatDate(refund.failedAt) : "—"}</p>
            </div>

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
