"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/FormField";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { createExportFn } from "@/services";
import { toastMessage, extractError } from "@/utils";
import { DatePicker } from "@/components/DatePicker";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportType: string;
  label: string;
  onComplete?: (jobId: string) => void;
}

export function ExportModal({ open, onOpenChange, exportType, label, onComplete }: ExportModalProps) {
  const [environment, setEnvironment] = useState("test");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const { mutateAsync: createExport, isPending } = useMutation({
    mutationFn: createExportFn,
    onSuccess: (res) => {
      toastMessage("success", "Export started");
      onOpenChange(false);
      onComplete?.(res?.data?.id ?? "");
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleExport = async () => {
    try {
      const filters: Record<string, string> = {};
      if (startDate) filters.createdFrom = startDate.toISOString();
      if (endDate) filters.createdTo = endDate.toISOString();

      await createExport({
        exportType,
        environment,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
    } catch {}
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Export ${label}`}
      description="Choose your export options"
    >
      <div className="space-y-4 pt-2">
        <FormField label="Environment" isRequired>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="live">Live</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <DatePicker value={startDate} onChange={setStartDate} label="Start Date" />
          <DatePicker value={endDate} onChange={setEndDate} label="End Date" maxDate={new Date()} />
        </div>

        <Button onClick={handleExport} className="w-full" disabled={isPending}>
          <Download className="size-4" />
          {isPending ? "Exporting..." : `Export ${label}`}
        </Button>
      </div>
    </ResponsiveModal>
  );
}
