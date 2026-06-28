"use client";

import type { ReactNode } from "react";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  errorMessage?: string;
  children: ReactNode;
}

export function DetailSheet({
  open,
  onOpenChange,
  title,
  isLoading,
  isError,
  onRetry,
  errorMessage,
  children,
}: DetailSheetProps) {
  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title={title}>
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={errorMessage ?? "Failed to load details"} onRetry={onRetry} />
      ) : (
        children
      )}
    </ResponsiveSheet>
  );
}
