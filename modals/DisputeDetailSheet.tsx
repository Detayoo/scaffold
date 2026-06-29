"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getDisputeDetailsFn } from "@/services";
import { formatMoney } from "@/utils";
import { SubmitEvidenceModal } from "@/modals/SubmitEvidenceModal";
import type { DisputeEvidenceItem, DisputeHold } from "@/types";

interface DisputeDetailSheetProps {
  disputeId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function DisputeDetailSheet({ disputeId, onOpenChange }: DisputeDetailSheetProps) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["dispute-detail", disputeId],
    queryFn: () => getDisputeDetailsFn({ id: disputeId! }),
    enabled: !!disputeId,
  });

  const dispute = data?.data?.dispute;
  const evidence = data?.data?.evidence;
  const holds = data?.data?.holds;
  const evidencePack = data?.data?.evidencePack;

  return (
    <>
      <ResponsiveSheet
        open={!!disputeId}
        onOpenChange={(o) => { if (!o) onOpenChange(false); }}
        title="Dispute Details"
      >
        <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load dispute details.">
          {dispute ? (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="text-sm font-medium">{dispute.reference}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm font-medium">{formatMoney(dispute.amountMinor)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={dispute.status ?? ""} size="sm" />
              </div>
              {dispute.reason && (
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="text-sm">{dispute.reason}</p>
                </div>
              )}

              {dispute.status === "evidence_required" && (
                <>
                  <Separator />
                  <Button className="w-full gap-2" onClick={() => setEvidenceOpen(true)}>
                    <Send className="size-4" />
                    Submit Evidence
                  </Button>
                </>
              )}

              {evidence && evidence.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Evidence</p>
                    <div className="space-y-2">
                      {evidence.map((e: DisputeEvidenceItem, i: number) => (
                        <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-1">
                          <p className="text-xs text-muted-foreground capitalize">{e.evidenceType}</p>
                          {e.note && <p className="text-sm">{e.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {holds && holds.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Holds</p>
                    <div className="space-y-2">
                      {holds.map((h: DisputeHold, i: number) => (
                        <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{formatMoney(h.amountMinor)}</p>
                            <StatusBadge status={h.status} size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {evidencePack && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Evidence Pack</p>
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">Customer</p>
                        <p className="text-sm">{evidencePack.customer?.name ?? "—"}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">Settlement Status</p>
                        <p className="text-sm capitalize">{evidencePack.settlement_status}</p>
                      </div>
                      {evidencePack.split_liabilities?.map((sl: { amountMinor: number; currency: string }, i: number) => (
                        <div key={i} className="flex justify-between">
                          <p className="text-xs text-muted-foreground">Split Liability</p>
                          <p className="text-sm font-medium">{formatMoney(sl.amountMinor)}</p>
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

      <SubmitEvidenceModal
        open={evidenceOpen}
        onOpenChange={setEvidenceOpen}
        disputeId={disputeId ?? ""}
        onSuccess={() => refetch()}
      />
    </>
  );
}
