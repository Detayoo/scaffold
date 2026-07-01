"use client";

import { useMutation } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePaylinkStatusFn } from "@/services";
import { toastMessage, extractError } from "@/utils";

const statusLabels: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

interface StatusSelectProps {
  paylinkId: string;
  currentStatus: string;
  onSuccess?: () => void;
  className?: string;
}

export function StatusSelect({ paylinkId, currentStatus, onSuccess, className }: StatusSelectProps) {
  const { mutateAsync: updateStatus } = useMutation({
    mutationFn: updatePaylinkStatusFn,
    onSuccess: () => {
      toastMessage("success", "Status updated");
      onSuccess?.();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleChange = async (status: string) => {
    if (status === currentStatus) return;
    try {
      await updateStatus({ id: paylinkId, status });
    } catch {}
  };

  return (
    <Select value={currentStatus} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
