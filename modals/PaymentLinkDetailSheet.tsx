"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check } from "lucide-react";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { getPaylinksFn } from "@/services";
import { formatMoney, formatDate } from "@/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

interface PaymentLinkDetailSheetProps {
  reference: string | null;
  onOpenChange: (open: boolean) => void;
  onToggleStatus?: (id: string, action: "active" | "inactive") => void;
}

export function PaymentLinkDetailSheet({ reference, onOpenChange, onToggleStatus }: PaymentLinkDetailSheetProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const copy = useCopyToClipboard();

  const handleCopy = async (text: string) => {
    const ok = await copy(text);
    if (ok) { setCopiedRef(true); setTimeout(() => setCopiedRef(false), 2000); }
  };

  const handleCopyUrl = async (text: string) => {
    const ok = await copy(text);
    if (ok) { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000); }
  };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["paylink-detail", reference],
    queryFn: () => getPaylinksFn({ reference: reference ?? undefined }),
    enabled: !!reference,
  });

  const pl = data?.data?.[0];

  return (
    <ResponsiveSheet
      open={!!reference}
      onOpenChange={(o) => { if (!o) onOpenChange(false); }}
      title="Payment Link Details"
      footer={pl ? (
        pl?.status === "active" ? (
          <button
            type="button"
            onClick={() => { onToggleStatus?.(pl.id, "inactive"); }}
            className="w-full inline-flex items-center justify-center rounded-md border bg-background px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 cursor-pointer"
          >
            Deactivate Link
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { onToggleStatus?.(pl.id, "active"); }}
            className="w-full inline-flex items-center justify-center rounded-md border bg-background px-4 py-2.5 text-sm font-medium cursor-pointer"
          >
            Activate Link
          </button>
        )
      ) : undefined}
    >
      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load payment link.">
        {pl ? (
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Reference</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{pl?.reference}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(pl?.reference ?? "")}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                >
                  {copiedRef ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                </button>
              </div>
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
            {pl?.payUrl && (
              <div>
                <p className="text-xs text-muted-foreground">URL</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 rounded-lg border bg-muted px-3 py-2 text-xs break-all">
                    {pl.payUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(pl.payUrl ?? "")}
                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                  >
                    {copiedUrl ? <Check className="size-4" /> : <Copy className="size-4" />}
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
