"use client";

import { useQuery } from "@tanstack/react-query";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { getTransactionDetailFn } from "@/services";
import { formatMoney, formatDate } from "@/utils";
import type { TimelineEntry } from "@/types";

interface TransactionDetailSheetProps {
  reference: string | null;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailSheet({ reference, onOpenChange }: TransactionDetailSheetProps) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["transaction-detail", reference],
    queryFn: () => getTransactionDetailFn({ reference: reference! }),
    enabled: !!reference,
  });

  const pi = data?.data?.intent;
  const financials = data?.data?.financials;
  const attempts = data?.data?.attempts;
  const refunds = data?.data?.refunds;
  const disputes = data?.data?.disputes;
  const credits = data?.data?.accountCredits;
  const splitAllocations = data?.data?.splitAllocations;
  const timelineEntries = data?.data?.timeline?.entries;

  return (
    <ResponsiveSheet
      open={!!reference}
      onOpenChange={(o) => { if (!o) onOpenChange(false); }}
      title="Transaction Details"
    >
      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load transaction details.">
        {pi ? (
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Reference</p>
              <p className="text-sm text-foreground">{pi?.reference}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm text-foreground">{formatMoney(pi?.amountMinor ?? pi?.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={pi?.status ?? ""} size="sm" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Channel</p>
              <p className="text-sm text-foreground capitalize">{pi?.channel}</p>
            </div>

            {financials && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Financials</p>
                  <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">Gross</p>
                      <p className="text-sm font-medium">{formatMoney(financials?.gross_amount_minor)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">Fee</p>
                      <p className="text-sm font-medium">{formatMoney(financials?.fee_amount_minor)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">Net</p>
                      <p className="text-sm font-medium">{formatMoney(financials?.net_amount_minor)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">Settlement Status</p>
                      <p className="text-sm capitalize">{financials?.settlement_status}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {attempts && attempts.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Attempts ({attempts.length})</p>
                  <div className="space-y-2">
                    {attempts.map((a: any, i: number) => (
                      <div key={a?.id ?? i} className="rounded-lg border bg-muted/30 p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground capitalize">{a?.channel}</p>
                          <StatusBadge status={a?.status} size="sm" />
                        </div>
                        <p className="text-xs text-muted-foreground">{a?.provider}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {refunds && refunds.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Refunds ({refunds.length})</p>
                  <div className="space-y-2">
                    {refunds.map((r: any, i: number) => (
                      <div key={r?.id ?? i} className="rounded-lg border bg-muted/30 p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{r?.reference}</p>
                          <StatusBadge status={r?.status} size="sm" />
                        </div>
                        <p className="text-sm font-medium">{formatMoney(r?.amountMinor)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {timelineEntries && timelineEntries.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-4">Timeline</p>
                  <div className="relative">
                    <div className="absolute left-[11px] top-[18px] bottom-[10px] w-[2px] bg-border" />
                    <div className="space-y-0">
                      {timelineEntries.map((t: TimelineEntry, i: number) => (
                        <div key={t?.source_id ?? i} className="relative flex gap-4 pb-5 last:pb-0">
                          <div className="flex flex-col items-center shrink-0">
                            <div className={`size-[24px] rounded-full flex items-center justify-center ${
                              i === 0
                                ? "bg-foreground"
                                : "bg-background border-2 border-border"
                            }`}>
                              <div className={`size-[8px] rounded-full ${
                                i === 0 ? "bg-background" : "bg-muted-foreground/40"
                              }`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pt-[3px]">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                {t?.occurred_at
                                  ? new Date(t.occurred_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
                                    " " +
                                    new Date(t.occurred_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                                  : "—"}
                              </p>
                              {t?.source && (
                                <span className="text-[10px] text-muted-foreground capitalize px-1.5 py-0.5 rounded bg-muted shrink-0">
                                  {t.source.replace(/_/g, " ")}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground mt-0.5">{t?.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {splitAllocations && splitAllocations.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Split Allocations</p>
                  <div className="space-y-2">
                    {splitAllocations.map((s: any, i: number) => (
                      <div key={s?.id ?? i} className="rounded-lg border bg-muted/30 p-3 space-y-1">
                        <div className="flex justify-between">
                          <p className="text-xs text-muted-foreground">Subaccount</p>
                          <p className="text-sm">{s?.subaccountId}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="text-sm font-medium">{formatMoney(s?.amountMinor)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {pi?.createdAt && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm text-foreground">{formatDate(pi.createdAt)}</p>
                </div>
              </>
            )}
          </div>
        ) : null}
      </AsyncContent>
    </ResponsiveSheet>
  );
}
