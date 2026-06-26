"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  className?: string;
  variant?: "spinner" | "skeleton";
  message?: string;
}

export function LoadingState({
  className,
  variant = "skeleton",
  message,
}: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div
        className={cn(
          "flex min-h-[300px] flex-col items-center justify-center gap-3 text-center",
          className
        )}
      >
        <div className="size-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton
              key={j}
              className="h-5"
              style={{
                width: `${[30, 25, 20, 15][j] ?? 20}%`,
                opacity: 1 - i * 0.12,
              }}
            />
          ))}
        </div>
      ))}
      {message && (
        <p className="text-center text-sm text-muted-foreground pt-2">
          {message}
        </p>
      )}
    </div>
  );
}
