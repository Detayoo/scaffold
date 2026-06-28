"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DetailRowProps {
  label: string;
  value: ReactNode;
  className?: string;
  mono?: boolean;
  capitalize?: boolean;
}

export function DetailRow({ label, value, className, mono, capitalize }: DetailRowProps) {
  return (
    <div className={cn(className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn(
        "text-sm font-medium",
        mono && "font-mono",
        capitalize && "capitalize"
      )}>
        {value ?? "—"}
      </p>
    </div>
  );
}
