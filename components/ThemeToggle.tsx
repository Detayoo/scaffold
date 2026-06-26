"use client";

import { motion, AnimatePresence } from "framer-motion";
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
        "relative flex h-8 w-16 shrink-0 items-center rounded-full border transition-colors",
        "bg-muted hover:bg-muted/80",
        className
      )}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "flex size-6 items-center justify-center rounded-full",
          "bg-background shadow-sm",
          isDark ? "ml-[2px]" : "ml-[34px]"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? "moon" : "sun"}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <Moon className="size-3.5 text-foreground" />
            ) : (
              <Sun className="size-3.5 text-foreground" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
