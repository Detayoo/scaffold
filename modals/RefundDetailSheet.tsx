"use client";

import { useQuery } from "@tanstack/react-query";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { getRefundDetailsFn } from "@/services";
import { formatMoney } from "@/utils";
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

  return (
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
              <p className="text-sm font-medium">{refund.reference}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm font-medium">{formatMoney(refund.amountMinor)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={refund.status ?? ""} size="sm" />
            </div>
            {refund.reason && (
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm">{refund.reason}</p>
              </div>
            )}

            {attempts && attempts.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Attempts</p>
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
