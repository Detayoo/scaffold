"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  isRequired?: boolean;
  isOptional?: boolean;
  children: ReactNode;
  className?: string;
  hideLabel?: boolean;
}

export function FormField({
  label,
  error,
  isRequired,
  isOptional,
  children,
  className,
  hideLabel,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2">
        <label
          className={cn(
            "text-sm font-medium text-foreground",
            hideLabel && "sr-only"
          )}
        >
          {label}
          {isOptional && (
            <span className="ml-1 text-muted-foreground">(Optional)</span>
          )}
          {isRequired && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      </div>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
