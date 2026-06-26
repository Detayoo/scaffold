"use client";

import { forwardRef } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/FormField";

interface DateInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  onBlur?: () => void;
  name?: string;
  label?: string;
  error?: string;
  isRequired?: boolean;
  isOptional?: boolean;
  className?: string;
  min?: string;
  max?: string;
  placeholder?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      name,
      label,
      error,
      isRequired,
      isOptional,
      className,
      min,
      max,
    },
    ref
  ) => {
    const input = (
      <div className="relative">
        <input
          ref={ref}
          type="date"
          name={name}
          value={value}
          onChange={(e) => onChange?.(e)}
          onBlur={onBlur}
          min={min}
          max={max}
          className={cn(
            "h-10 w-full rounded-lg border border-input bg-background px-3 py-1.5 pr-10 text-sm text-foreground transition-colors",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "aria-invalid:border-destructive",
            "placeholder:text-muted-foreground",
            "[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
            error && "border-destructive",
            !value && "text-muted-foreground",
            className
          )}
        />
        <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    );

    if (!label) return input;

    return (
      <FormField
        label={label}
        error={error}
        isRequired={isRequired}
        isOptional={isOptional}
      >
        {input}
      </FormField>
    );
  }
);

DateInput.displayName = "DateInput";
