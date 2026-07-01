"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check } from "lucide-react";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { getPaylinksFn } from "@/services";
import { formatMoney, formatDate } from "@/utils";

interface PaymentLinkDetailSheetProps {
  reference: string | null;
  onOpenChange: (open: boolean) => void;
}

export function PaymentLinkDetailSheet({ reference, onOpenChange }: PaymentLinkDetailSheetProps) {
  const [copied, setCopied] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["paylink-detail", reference],
    queryFn: () => getPaylinksFn({ reference: reference ?? undefined }),
    enabled: !!reference,
  });

  const pl = data?.data?.[0];

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <ResponsiveSheet
      open={!!reference}
      onOpenChange={(o) => { if (!o) onOpenChange(false); }}
      title="Payment Link Details"
    >
      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load payment link.">
        {pl ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="text-sm font-medium">{pl?.reference}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={pl?.status ?? ""} size="sm" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm font-medium">{pl?.amountMinor ? formatMoney(pl.amountMinor) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Environment</p>
                <p className="text-sm capitalize">{pl?.environment ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Currency</p>
                <p className="text-sm font-medium">{pl?.currency ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Channels</p>
                <p className="text-sm capitalize">{pl?.channels?.length ? pl.channels.join(", ") : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{pl?.createdAt ? formatDate(pl.createdAt) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Updated</p>
                <p className="text-sm">{pl?.updatedAt ? formatDate(pl.updatedAt) : "—"}</p>
              </div>
            </div>
            {pl?.payUrl && (
              <div>
                <p className="text-xs text-muted-foreground">URL</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 rounded-lg border bg-muted px-3 py-2 text-xs break-all">
                    {pl.payUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(pl.payUrl ?? "")}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>
            )}
            {pl?.metadata && Object.keys(pl.metadata).length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Metadata</p>
                <pre className="mt-1 rounded-lg border bg-muted px-3 py-2 text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(pl.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : null}
      </AsyncContent>
    </ResponsiveSheet>
  );
}
