"use client";

import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { getRefundDetailsFn } from "@/services";
import { formatMoney, formatDate } from "@/utils";
import type { RefundAttempt } from "@/types";

interface RefundDetailSheetProps {
  refundId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function RefundDetailSheet({ refundId, onOpenChange }: RefundDetailSheetProps) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["refund-detail", refundId],
    queryFn: () => getRefundDetailsFn({ id: refundId! }),
    enabled: !!refundId,
  });

  const refund = data?.data?.refund;
  const attempts = data?.data?.attempts;

  const field = (label: string, value: any, formatter?: (v: any) => React.ReactNode) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value != null && value !== "" ? (formatter ? formatter(value) : String(value)) : "—"}</p>
    </div>
  );

  const badgeField = (label: string, value: string) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <StatusBadge status={value} size="sm" />
    </div>
  );

  return (
    <ResponsiveSheet
      open={!!refundId}
      onOpenChange={(o) => { if (!o) onOpenChange(false); }}
      title="Refund Details"
    >
      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load refund details.">
        {refund ? (
          <div className="space-y-4 pt-2">
            {field("Reference", refund?.reference)}
            {badgeField("Status", refund?.status)}
            {field("Amount", refund?.amountMinor, (v) => `${refund?.currency ?? "NGN"} ${formatMoney(v)}`)}
            {field("Currency", refund?.currency)}
            {field("Environment", refund?.environment)}
            {field("Execution Mode", refund?.executionMode, (v) => v?.replace(/_/g, " "))}
            {field("Fee Policy", refund?.feePolicy, (v) => v?.replace(/_/g, " "))}
            {field("Fee Refund Amount", refund?.feeRefundAmountMinor, (v) => formatMoney(v))}
            {field("Merchant Debit Amount", refund?.merchantDebitAmountMinor, (v) => formatMoney(v))}
            {field("Requires Manual Funding", refund?.requiresManualFunding, (v) => v ? "Yes" : "No")}
            {field("Reason", refund?.reason)}
            {field("Rejection Reason", refund?.rejectionReason)}

            <Separator />
            <p className="text-xs font-medium text-muted-foreground">Timeline</p>
            {field("Created", refund?.createdAt, formatDate)}
            {field("Updated", refund?.updatedAt, formatDate)}
            {field("Approved", refund?.approvedAt, formatDate)}
            {field("Rejected", refund?.rejectedAt, formatDate)}
            {field("Processed", refund?.processedAt, formatDate)}
            {field("Succeeded", refund?.succeededAt, formatDate)}
            {field("Failed", refund?.failedAt, formatDate)}

            {refund?.metadata && Object.keys(refund.metadata).length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Metadata</p>
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                    {refund.metadata.remaining_refundable_minor != null && (
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">Remaining Refundable</p>
                        <p className="text-sm text-foreground">{formatMoney(refund.metadata.remaining_refundable_minor)}</p>
                      </div>
                    )}
                    {refund.metadata.settlement_status_at_request && (
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">Settlement at Request</p>
                        <p className="text-sm text-foreground capitalize">{refund.metadata.settlement_status_at_request}</p>
                      </div>
                    )}
                    {refund.metadata.rail_support && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Rail Support</p>
                        <p className="text-sm text-foreground">Provider: {refund.metadata.rail_support.provider}</p>
                        <p className="text-sm text-foreground">Channel: {refund.metadata.rail_support.channel}</p>
                        <p className="text-sm text-foreground">Mode: {refund.metadata.rail_support.mode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {attempts && attempts.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Attempts ({attempts.length})</p>
                  <div className="space-y-2">
                    {attempts.map((a: RefundAttempt) => (
                      <div key={a.id} className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground capitalize">{a.channel}</p>
                          <StatusBadge status={a.status} size="sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{a.provider}</p>
                          <p className="text-sm font-medium">{formatMoney(a.amountMinor)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </AsyncContent>
    </ResponsiveSheet>
  );
}
