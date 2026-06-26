"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
  errorCode?: number;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
  className,
  errorCode,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center gap-3 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <div className="max-w-[320px] space-y-1">
        <p className="text-sm font-medium text-foreground">Error</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {errorCode !== 403 && onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw />
          Retry
        </Button>
      )}
    </div>
  );
}
