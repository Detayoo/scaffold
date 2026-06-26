"use client";

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({
  className,
  message,
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "size-5 border-[1.5px]",
    md: "size-8 border-2",
    lg: "size-10 border-[2.5px]",
  };

  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center gap-3 text-center",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-foreground/20 border-t-foreground",
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
