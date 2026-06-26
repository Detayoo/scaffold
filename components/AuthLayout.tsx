"use client";

import type { ReactNode } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Logo } from "@/components/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-svh w-full">
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed right-4 top-4 z-50 flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground hover:text-foreground transition-colors"
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className={className}>{children}</div>
        </div>
      </div>
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/10" />
        <div className="flex h-full items-center justify-center">
          <Logo size={120} />
        </div>
      </div>
    </div>
  );
}
