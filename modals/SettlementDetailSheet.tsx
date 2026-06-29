"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Banknote } from "lucide-react";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/FormField";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { approveSettlementFn, markSettlementPaidFn } from "@/services";
import { formatMoney, toastMessage, extractError } from "@/utils";
import type { SettlementBatch } from "@/types";

interface SettlementDetailSheetProps {
  batch: SettlementBatch | null;
  onOpenChange: (open: boolean) => void;
}

export function SettlementDetailSheet({ batch, onOpenChange }: SettlementDetailSheetProps) {
  const [action, setAction] = useState<string | null>(null);
  const [paidAt, setPaidAt] = useState("");
  const [bank, setBank] = useState("");
  const [nibssRef, setNibssRef] = useState("");

  const { mutateAsync: approve, isPending: approving } = useMutation({
    mutationFn: approveSettlementFn,
    onSuccess: () => { toastMessage("success", "Settlement approved"); setAction(null); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: markPaid, isPending: markingPaid } = useMutation({
    mutationFn: markSettlementPaidFn,
    onSuccess: () => { toastMessage("success", "Settlement marked as paid"); setAction(null); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleConfirm = async () => {
    if (!batch?.id) return;
    try {
      if (action === "approve") {
        await approve({ id: batch.id });
      } else if (action === "mark-paid") {
        await markPaid({
          id: batch.id,
          provider: "bank",
          paidAt: paidAt || new Date().toISOString(),
          evidence: { bank, nibss_reference: nibssRef },
        });
      }
    } catch {}
    setAction(null);
  };

  return (
    <>
      <ResponsiveSheet
        open={!!batch}
        onOpenChange={(o) => { if (!o) onOpenChange(false); }}
        title="Settlement Details"
      >
        {batch ? (
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Batch ID</p>
              <p className="text-sm text-foreground font-mono text-xs">{batch?.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={batch?.status} size="sm" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Amount</p>
              <p className="text-sm font-medium text-foreground">{formatMoney(batch?.netAmountMinor)}</p>
            </div>
            {batch?.channel && (
              <div>
                <p className="text-xs text-muted-foreground">Channel</p>
                <p className="text-sm text-foreground capitalize">{batch?.channel}</p>
              </div>
            )}
            {batch?.provider && (
              <div>
                <p className="text-xs text-muted-foreground">Provider</p>
                <p className="text-sm text-foreground">{batch?.provider}</p>
              </div>
            )}
            {batch?.itemCount !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="text-sm text-foreground">{batch?.itemCount}</p>
              </div>
            )}
            {batch?.approvedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Approved At</p>
                <p className="text-sm text-foreground">{batch?.approvedAt}</p>
              </div>
            )}

            {batch?.status === "generated" && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Button className="gap-2 w-full" onClick={() => setAction("approve")} disabled={approving}>
                    <CheckCircle2 className="size-4" /> Approve
                  </Button>
                </div>
              </>
            )}

            {batch?.status === "approved" && (
              <>
                <Separator />
                <div className="space-y-3">
                  <FormField label="Paid At" isRequired>
                    <Input type="datetime-local" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
                  </FormField>
                  <FormField label="Bank" isRequired>
                    <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="GTBank" />
                  </FormField>
                  <FormField label="NIBSS Reference" isRequired>
                    <Input value={nibssRef} onChange={(e) => setNibssRef(e.target.value)} placeholder="NIP/GTB/20260630/556677" />
                  </FormField>
                  <Button className="gap-2 w-full" onClick={() => setAction("mark-paid")} disabled={markingPaid || !bank || !nibssRef}>
                    <Banknote className="size-4" /> Mark as Paid
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </ResponsiveSheet>

      <ConfirmDialog
        open={action === "approve"}
        onOpenChange={(o) => { if (!o) setAction(null); }}
        title="Approve Settlement"
        description="Approve this settlement batch?"
        confirmLabel="Approve"
        onConfirm={handleConfirm}
        loading={approving}
      />

      <ConfirmDialog
        open={action === "mark-paid"}
        onOpenChange={(o) => { if (!o) setAction(null); }}
        title="Mark as Paid"
        description="Mark this settlement as paid?"
        confirmLabel="Mark Paid"
        onConfirm={handleConfirm}
        loading={markingPaid}
      />
    </>
  );
}
