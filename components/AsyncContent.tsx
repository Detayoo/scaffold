"use client";

import type { ReactNode } from "react";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

interface AsyncContentProps {
  isPending: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
  errorMessage?: string;
  errorCode?: number;
  children: ReactNode;
}

export function AsyncContent({
  isPending,
  isError,
  error,
  onRetry,
  errorMessage,
  errorCode,
  children,
}: AsyncContentProps) {
  if (isPending) return <LoadingState />;
  if (isError)
    return (
      <ErrorState
        message={errorMessage}
        onRetry={onRetry}
        errorCode={errorCode}
      />
    );
  return <>{children}</>;
}
