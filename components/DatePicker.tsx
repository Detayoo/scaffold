"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormField } from "@/components/FormField";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  error?: string;
  isRequired?: boolean;
  isOptional?: boolean;
  className?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  error,
  isRequired,
  isOptional,
  className,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const trigger = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 w-full justify-start gap-2 px-3 text-left font-normal",
            "border-input bg-background hover:bg-background",
            !value && "text-muted-foreground",
            error && "border-destructive",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );

  if (!label) return trigger;

  return (
    <FormField label={label} error={error} isRequired={isRequired} isOptional={isOptional}>
      {trigger}
    </FormField>
  );
}
