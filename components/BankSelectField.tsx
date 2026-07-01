"use client";

import { SearchableSelect } from "@/components/SearchableSelect";
import { useBanks } from "@/hooks/use-banks";

interface BankSelectFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  isRequired?: boolean;
  label?: string;
}

export function BankSelectField({ value, onValueChange, placeholder = "Search and select a bank...", error, isRequired, label }: BankSelectFieldProps) {
  const { data: banks, isFetching } = useBanks();

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {isRequired && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}
      <SearchableSelect
        options={banks?.map((b) => ({ value: b.code, label: b.name })) ?? []}
        value={value}
        onValueChange={onValueChange}
        placeholder={isFetching ? "Loading banks..." : placeholder}
        searchPlaceholder="Search banks..."
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
