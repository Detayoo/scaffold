"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  showClear?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "Search...",
  className,
  showClear,
}: SearchInputProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        />
      </div>
      <Button variant="default" onClick={onSearch}>
        Search
      </Button>
      {showClear && onClear && (
        <Button variant="ghost" onClick={onClear}>
          <X className="size-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
