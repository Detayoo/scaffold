"use client";

import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-8 w-[58px] shrink-0 items-center rounded-full border transition-colors duration-300",
        "bg-muted hover:bg-muted/80",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
    >
      <span
        className={cn(
          "flex size-[22px] items-center justify-center rounded-full bg-background shadow-sm transition-all duration-300",
          isDark ? "translate-x-[2px]" : "translate-x-[32px]"
        )}
      >
        {isDark ? (
          <Moon className="size-3 text-foreground" />
        ) : (
          <Sun className="size-3 text-foreground" />
        )}
      </span>
    </button>
  );
}
