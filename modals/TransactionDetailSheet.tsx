"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { getTransactionDetailFn, getAdminTransactionDetailFn, getTransactionSplitSnapshotFn } from "@/services";
import { formatMoney, formatDate } from "@/utils";
import type { TimelineEntry } from "@/types";

interface TransactionDetailSheetProps {
  reference: string | null;
  onOpenChange: (open: boolean) => void;
  admin?: boolean;
}

export function TransactionDetailSheet({ reference, onOpenChange, admin }: TransactionDetailSheetProps) {
  const copy = useCopyToClipboard();
  const [copied, setCopied] = useState(false);
  const [copiedProvRef, setCopiedProvRef] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const SectionToggle = ({ sectionKey, label, count }: { sectionKey: string; label: string; count?: number }) => (
    <button type="button" onClick={() => toggle(sectionKey)} className="flex items-center gap-2 text-sm font-medium text-foreground mb-2 cursor-pointer hover:text-muted-foreground transition-colors">
      {openSections[sectionKey] ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
      {label}{count !== undefined ? ` (${count})` : ""}
    </button>
  );

  const detailFn = admin ? getAdminTransactionDetailFn : getTransactionDetailFn;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["transaction-detail", reference, admin],
    queryFn: () => detailFn({ reference: reference! }),
    enabled: !!reference,
  });

  const pi = data?.data?.intent;
  const financials = data?.data?.financials;
  const attempts = data?.data?.attempts;
  const refunds = data?.data?.refunds;
  const timelineEntries = data?.data?.timeline?.entries;
  const splitAllocations = data?.data?.splitAllocations;
  const [showSplit, setShowSplit] = useState(false);

  const { data: splitData, isFetching: splitLoading } = useQuery({
    queryKey: ["transaction-split", reference],
    queryFn: () => getTransactionSplitSnapshotFn({ reference: reference! }),
    enabled: showSplit && !!reference,
  });

  const handleCopy = async (text: string) => {
    const ok = await copy(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleCopyProvRef = async (text: string) => {
    const ok = await copy(text);
    if (ok) { setCopiedProvRef(true); setTimeout(() => setCopiedProvRef(false), 2000); }
  };

  return (
    <ResponsiveSheet
      open={!!reference}
      onOpenChange={(o) => { if (!o) { onOpenChange(false); setShowSplit(false); } }}
      title="Transaction Details"
    >
      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load transaction details.">
        {pi ? (
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Reference</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-foreground">{pi?.reference}</p>
                <button type="button" onClick={() => handleCopy(pi?.reference ?? "")} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm text-foreground">{formatMoney(pi?.amountMinor ?? pi?.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={pi?.status ?? ""} size="sm" />
            </div>
            {pi?.channels && pi?.channels?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Channels</p>
                <p className="text-sm text-foreground capitalize">{pi?.channels?.join(", ").replace(/_/g, " ")}</p>
              </div>
            )}
            {pi?.customer?.name && (
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="text-sm text-foreground">{pi?.customer?.name}</p>
                {pi?.customer?.email && <p className="text-sm text-foreground">{pi?.customer?.email}</p>}
                {pi?.customer?.phone && <p className="text-sm text-foreground">{pi?.customer?.phone}</p>}
              </div>
            )}
            {pi?.environment && (
              <div>
                <p className="text-xs text-muted-foreground">Environment</p>
                <p className="text-sm text-foreground capitalize">{pi?.environment}</p>
              </div>
            )}
            {pi?.createdAt && (
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm text-foreground">{formatDate(pi?.createdAt)}</p>
              </div>
            )}
            {pi?.expiresAt && (
              <div>
                <p className="text-xs text-muted-foreground">Expires</p>
                <p className="text-sm text-foreground">{formatDate(pi?.expiresAt)}</p>
              </div>
            )}

            {financials && (
              <>
                <Separator />
                <div>
                  <SectionToggle sectionKey="financials" label="Financials" />
                  {openSections["financials"] && (
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
                    </div>
                  )}
                </div>
              </>
            )}

            {attempts && attempts.length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionToggle sectionKey="attempts" label="Attempts" count={attempts.length} />
                  {openSections["attempts"] && (
                    <div className="space-y-2">
                      {attempts.map((a: any, i: number) => (
                        <div key={a?.id ?? i} className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground capitalize">{a?.channel?.replace(/_/g, " ")}</p>
                            <StatusBadge status={a?.status} size="sm" />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{a?.provider}</p>
                            <p className="text-sm font-medium">{formatMoney(a?.amountMinor)}</p>
                          </div>
                          {a?.grossAmountMinor != null && <div className="flex justify-between"><p className="text-xs text-muted-foreground">Gross</p><p className="text-xs">{formatMoney(a?.grossAmountMinor)}</p></div>}
                          {a?.feeAmountMinor != null && <div className="flex justify-between"><p className="text-xs text-muted-foreground">Fee</p><p className="text-xs">{formatMoney(a?.feeAmountMinor)}</p></div>}
                          {a?.netAmountMinor != null && <div className="flex justify-between"><p className="text-xs text-muted-foreground">Net</p><p className="text-xs">{formatMoney(a?.netAmountMinor)}</p></div>}
                          {a?.feeBearer && <div className="flex justify-between"><p className="text-xs text-muted-foreground">Fee Bearer</p><p className="text-xs capitalize">{a?.feeBearer}</p></div>}
                          {a?.providerReference && (
                            <div className="flex items-center gap-1">
                              <p className="text-xs text-muted-foreground">Ref: {a?.providerReference}</p>
                              <button type="button" onClick={() => handleCopyProvRef(a?.providerReference)} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                {copiedProvRef ? <Check className="size-3" /> : <Copy className="size-3" />}
                              </button>
                            </div>
                          )}
                          {a?.actionRequired?.type && a?.actionRequired?.type !== "none" && (
                            <p className="text-xs text-muted-foreground">Action: {a?.actionRequired?.type}</p>
                          )}
                          {a?.failureCode && <p className="text-xs text-destructive">Failure: {a?.failureCode?.replace(/_/g, " ")}</p>}
                          {a?.providerData?.responseMessage && <p className="text-xs text-muted-foreground">{a?.providerData?.responseMessage}</p>}
                          {a?.createdAt && <p className="text-xs text-muted-foreground">{formatDate(a?.createdAt)}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {refunds && refunds.length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionToggle sectionKey="refunds" label="Refunds" count={refunds.length} />
                  {openSections["refunds"] && (
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
                  )}
                </div>
              </>
            )}

            {timelineEntries && timelineEntries.length > 0 && (
              <>
                <Separator />
                <div>
                  <SectionToggle sectionKey="timeline" label="Timeline" />
                  {openSections["timeline"] && (
                    <div className="relative">
                      <div className="absolute left-[11px] top-[18px] bottom-[10px] w-[2px] bg-border" />
                      <div className="space-y-0">
                        {timelineEntries.map((t: TimelineEntry, i: number) => (
                          <div key={t?.source_id ?? i} className="relative flex gap-4 pb-5 last:pb-0">
                            <div className="flex flex-col items-center shrink-0">
                              <div className={`size-[24px] rounded-full flex items-center justify-center ${i === 0 ? "bg-foreground" : "bg-background border-2 border-border"}`}>
                                <div className={`size-[8px] rounded-full ${i === 0 ? "bg-background" : "bg-muted-foreground/40"}`} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 pt-[3px]">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-muted-foreground">
                                  {t?.occurred_at
                                    ? new Date(t.occurred_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
                                      " " + new Date(t.occurred_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
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
                  )}
                </div>
              </>
            )}

            {(splitAllocations && splitAllocations.length > 0) || splitData?.data?.allocations?.length > 0 ? (
              <>
                <Separator />
                <div>
                  <SectionToggle sectionKey="splits" label="Split Allocations" count={splitData?.data?.allocations?.length ?? splitAllocations?.length ?? 0} />
                  {openSections["splits"] && (
                    <div className="space-y-3">
                      {!showSplit ? (
                        <button
                          type="button"
                          onClick={() => setShowSplit(true)}
                          className="w-full rounded-lg border border-dashed bg-muted/20 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer text-center"
                        >
                          Load full split details (allocations &amp; liabilities)
                        </button>
                      ) : splitLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="size-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                        </div>
                      ) : splitData?.data?.allocations ? (
                        <>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Allocations</p>
                            <div className="space-y-2">
                              {splitData.data.allocations.map((a: any, i: number) => (
                                <div key={a?.id ?? i} className="rounded-lg border bg-muted/30 p-3 space-y-1">
                                  <div className="flex justify-between">
                                    <p className="text-xs text-muted-foreground">Subaccount</p>
                                    <p className="text-sm text-foreground">{a?.subaccountId}</p>
                                  </div>
                                  <div className="flex justify-between">
                                    <p className="text-xs text-muted-foreground">Amount</p>
                                    <p className="text-sm font-medium text-foreground">{a?.currency} {formatMoney(a?.amountMinor)}</p>
                                  </div>
                                  <div className="flex justify-between">
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <StatusBadge status={a?.status} size="sm" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {splitData.data.liabilities?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Liabilities</p>
                              <div className="space-y-2">
                                {splitData.data.liabilities.map((l: any, i: number) => (
                                  <div key={l?.id ?? i} className="rounded-lg border border-warning/20 bg-warning/5 p-3 space-y-1">
                                    <div className="flex justify-between">
                                      <p className="text-xs text-muted-foreground">Source</p>
                                      <p className="text-sm capitalize text-foreground">{l?.sourceType}</p>
                                    </div>
                                    <div className="flex justify-between">
                                      <p className="text-xs text-muted-foreground">Amount</p>
                                      <p className="text-sm font-medium text-foreground">{l?.currency} {formatMoney(l?.amountMinor)}</p>
                                    </div>
                                    <div className="flex justify-between">
                                      <p className="text-xs text-muted-foreground">Status</p>
                                      <StatusBadge status={l?.status} size="sm" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </AsyncContent>
    </ResponsiveSheet>
  );
}
