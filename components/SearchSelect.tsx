"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Check, ChevronDown, ChevronUp, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface SearchSelectOption {
  value: string;
  label: string;
  metadata?: string;
}

interface SearchSelectProps {
  options: SearchSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  isRequired?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  label,
  error,
  isRequired,
  loading,
  emptyMessage = "No results found",
  className,
  disabled,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => searchRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);


  const triggerContent = (
    <div
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!disabled) setOpen(true);
        }
      }}
      onClick={() => {
        if (!disabled) setOpen(!open);
      }}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-50",
        error && "border-destructive",
        className
      )}
    >
      <span
        className={cn(
          "truncate",
          !selected && "text-muted-foreground"
        )}
      >
        {selected?.label ?? placeholder}
      </span>
      {open ? (
        <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
      ) : (
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      )}
    </div>
  );

  const listContent = (
    <div className="p-0">
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="max-h-[250px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div role="listbox">
            {filtered.map((option) => (
              <div
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-muted",
                  option.value === value && "bg-muted font-medium"
                )}
              >
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.metadata && (
                    <span className="text-xs text-muted-foreground">
                      {option.metadata}
                    </span>
                  )}
                </div>
                {option.value === value && (
                  <Check className="size-4 text-foreground" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {isRequired && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}

      {isMobile ? (
        <>
          {triggerContent}
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent>
              <DrawerHeader className="sr-only">
                <DrawerTitle>{searchPlaceholder}</DrawerTitle>
              </DrawerHeader>
              {listContent}
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <div className="relative">
          {triggerContent}
          {open && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpen(false)}
              />
              <div className="absolute z-50 mt-1 w-full min-w-[200px] rounded-lg border bg-popover text-popover-foreground shadow-md">
                {listContent}
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
