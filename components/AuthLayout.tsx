"use client";

import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh w-full">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className={className}>{children}</div>
        </div>
      </div>
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/10" />
        <div className="flex h-full items-center justify-center p-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <Logo size={96} />
            <h2 className="text-2xl font-semibold tracking-tight">
              Manage your payments in one place
            </h2>
            <p className="max-w-sm text-muted-foreground">
              Monitor transactions, create payment links, send invoices, and
              manage your team — all from a single dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
