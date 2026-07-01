"use client";

import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { StatusBadge } from "@/components/StatusBadge";
import { updatePaylinkStatusFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const statusOptions = ["draft", "active", "paused", "archived"] as const;
const statusLabels: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

interface StatusUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paylinkId: string;
  currentStatus: string;
  onSuccess?: () => void;
}

export function StatusUpdateModal({ open, onOpenChange, paylinkId, currentStatus, onSuccess }: StatusUpdateModalProps) {
  const { mutateAsync: updateStatus, isPending: updating } = useMutation({
    mutationFn: updatePaylinkStatusFn,
    onSuccess: () => {
      toastMessage("success", "Status updated");
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleSelect = async (status: string) => {
    if (status === currentStatus) {
      onOpenChange(false);
      return;
    }
    try {
      await updateStatus({ id: paylinkId, status });
    } catch {}
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Update Status"
      description="Select a new status for this payment link"
    >
      <div className="space-y-1.5 pt-2">
        {statusOptions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={updating}
            onClick={() => handleSelect(s)}
            className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors cursor-pointer disabled:opacity-50 ${
              s === currentStatus
                ? "border-ring bg-accent"
                : "border-border hover:bg-muted"
            }`}
          >
            <span className="font-medium">{statusLabels[s]}</span>
            <StatusBadge status={s} size="sm" />
          </button>
        ))}
      </div>
    </ResponsiveModal>
  );
}
