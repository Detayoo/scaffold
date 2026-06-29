"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UserCheck, Lock, Award, XCircle } from "lucide-react";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/FormField";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { assignAdminDisputeFn, holdAdminDisputeFn, outcomeAdminDisputeFn, closeAdminDisputeFn } from "@/services";
import { formatMoney, toastMessage, extractError } from "@/utils";
import type { DisputeCase } from "@/types";

interface AdminDisputeDetailSheetProps {
  dispute: DisputeCase | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AdminDisputeDetailSheet({ dispute, onOpenChange, onSuccess }: AdminDisputeDetailSheetProps) {
  const [assigning, setAssigning] = useState(false);
  const [recordingOutcome, setRecordingOutcome] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [outcome, setOutcome] = useState("");
  const [note, setNote] = useState("");

  const status = dispute?.status;

  const { mutateAsync: assign, isPending: isAssigning } = useMutation({
    mutationFn: assignAdminDisputeFn,
    onSuccess: () => { toastMessage("success", "Dispute assigned"); setAssigning(false); onSuccess?.(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: hold, isPending: isHolding } = useMutation({
    mutationFn: holdAdminDisputeFn,
    onSuccess: () => { toastMessage("success", "Hold placed"); setConfirmAction(null); onSuccess?.(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: recordOutcome, isPending: isRecording } = useMutation({
    mutationFn: outcomeAdminDisputeFn,
    onSuccess: () => { toastMessage("success", "Outcome recorded"); setRecordingOutcome(false); onSuccess?.(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: close, isPending: isClosing } = useMutation({
    mutationFn: closeAdminDisputeFn,
    onSuccess: () => { toastMessage("success", "Dispute closed"); setConfirmAction(null); onSuccess?.(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleAssign = async () => {
    if (!dispute?.id || !ownerId || !ownerName) return;
    try {
      await assign({ id: dispute.id, ownerId, ownerName });
    } catch {}
  };

  const handleOutcome = async () => {
    if (!dispute?.id || !outcome) return;
    try {
      await recordOutcome({ id: dispute.id, outcome, note: note || undefined });
    } catch {}
  };

  const handleConfirm = async () => {
    if (!dispute?.id) return;
    try {
      if (confirmAction === "hold") {
        await hold({ id: dispute.id, amountMinor: dispute.amountMinor, holdScope: "merchant" });
      } else if (confirmAction === "close") {
        await close({ id: dispute.id, note: note || undefined });
      }
    } catch {}
    setConfirmAction(null);
  };

  const canAssign = status && !["won", "lost", "accepted", "closed"].includes(status);
  const canHold = status && ["opened", "evidence_required"].includes(status);
  const canOutcome = status && ["evidence_submitted", "under_review"].includes(status);
  const canClose = status && ["won", "lost", "accepted"].includes(status);

  return (
    <>
      <ResponsiveSheet
        open={!!dispute}
        onOpenChange={(o) => { if (!o) { onOpenChange(false); setAssigning(false); setRecordingOutcome(false); } }}
        title="Dispute Details"
      >
        {dispute ? (
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Reference</p>
              <p className="text-sm text-foreground">{dispute?.reference}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm text-foreground">{formatMoney(dispute?.amountMinor)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={dispute?.status ?? ""} size="sm" />
            </div>
            {dispute?.reason && (
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm text-foreground">{dispute?.reason}</p>
              </div>
            )}

            {(canAssign || canHold || canOutcome || canClose) && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  {canAssign && !assigning && !recordingOutcome && (
                    <Button variant="outline" className="gap-2 w-full" onClick={() => { setAssigning(true); setOwnerId(""); setOwnerName(""); }}>
                      <UserCheck className="size-4" /> Assign
                    </Button>
                  )}
                  {assigning && (
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                      <FormField label="Owner ID" isRequired>
                        <Input value={ownerId} onChange={(e) => setOwnerId(e.target.value)} placeholder="ops_user_lagos_01" />
                      </FormField>
                      <FormField label="Owner Name" isRequired>
                        <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Finance Ops Lagos" />
                      </FormField>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setAssigning(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleAssign} disabled={isAssigning || !ownerId || !ownerName}>
                          {isAssigning ? "Assigning..." : "Assign"}
                        </Button>
                      </div>
                    </div>
                  )}
                  {canHold && !assigning && !recordingOutcome && (
                    <Button variant="outline" className="gap-2 w-full" onClick={() => setConfirmAction("hold")} disabled={isHolding}>
                      <Lock className="size-4" /> Place Hold
                    </Button>
                  )}
                  {canOutcome && !assigning && !recordingOutcome && (
                    <Button className="gap-2 w-full" onClick={() => { setRecordingOutcome(true); setOutcome(""); setNote(""); }}>
                      <Award className="size-4" /> Record Outcome
                    </Button>
                  )}
                  {recordingOutcome && (
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                      <FormField label="Outcome" isRequired>
                        <Select value={outcome} onValueChange={setOutcome}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select outcome" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                      <FormField label="Note">
                        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
                      </FormField>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setRecordingOutcome(false)}>Cancel</Button>
                        <Button className="flex-1" onClick={handleOutcome} disabled={isRecording || !outcome}>
                          {isRecording ? "Recording..." : "Record"}
                        </Button>
                      </div>
                    </div>
                  )}
                  {canClose && !assigning && !recordingOutcome && (
                    <Button variant="outline" className="gap-2 w-full" onClick={() => { setConfirmAction("close"); setNote(""); }}>
                      <XCircle className="size-4" /> Close Dispute
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : null}
      </ResponsiveSheet>

      <ConfirmDialog
        open={confirmAction === "hold"}
        onOpenChange={(o) => { if (!o) setConfirmAction(null); }}
        title="Place Hold"
        description="Place a hold on merchant balances for this dispute amount?"
        confirmLabel="Place Hold"
        onConfirm={() => handleConfirm()}
        loading={isHolding}
      />

      <ConfirmDialog
        open={confirmAction === "close"}
        onOpenChange={(o) => { if (!o) setConfirmAction(null); }}
        title="Close Dispute"
        description="Close this dispute?"
        confirmLabel="Close"
        variant="destructive"
        onConfirm={() => handleConfirm()}
        loading={isClosing}
      />
    </>
  );
}
