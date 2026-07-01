"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { FormField } from "@/components/FormField";
import { updatePaylinkStatusFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

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
  const [selected, setSelected] = useState(currentStatus);

  const { mutateAsync: updateStatus, isPending: updating } = useMutation({
    mutationFn: updatePaylinkStatusFn,
    onSuccess: () => {
      toastMessage("success", "Status updated");
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleSubmit = async () => {
    try {
      await updateStatus({ id: paylinkId, status: selected });
    } catch {}
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(o) => { if (!o) { onOpenChange(false); setSelected(currentStatus); } }}
      title="Update Status"
      description="Select a new status for this payment link"
    >
      <div className="space-y-4 pt-2">
        <FormField label="Status">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => { onOpenChange(false); setSelected(currentStatus); }} disabled={updating}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={updating || selected === currentStatus}>
            {updating ? "Updating..." : "Update"}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
