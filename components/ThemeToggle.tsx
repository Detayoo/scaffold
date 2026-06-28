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
        "relative flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={cn(
          "flex size-[22px] items-center justify-center rounded-full bg-background shadow-sm transition-all duration-200",
          isDark ? "translate-x-[2px]" : "translate-x-[30px]"
        )}
      >
        {isDark ? (
          <Moon className="size-2.5 text-foreground" />
        ) : (
          <Sun className="size-2.5 text-foreground" />
        )}
      </span>
    </button>
  );
}
