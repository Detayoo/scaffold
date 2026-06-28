"use client";

import type { ReactNode } from "react";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  onApply: () => void;
  onClear: () => void;
  applyLabel?: string;
  clearLabel?: string;
}

export function FilterModal({
  open,
  onOpenChange,
  title = "Filters",
  description,
  children,
  onApply,
  onClear,
  applyLabel = "Apply Filters",
  clearLabel = "Clear",
}: FilterModalProps) {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <div className="space-y-4 pt-2">
        {children}
        <div className="flex gap-2 pt-2">
          <Button variant="default" className="flex-1" onClick={onApply}>
            {applyLabel}
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClear}>
            {clearLabel}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
