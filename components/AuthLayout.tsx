"use client";

import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh w-full">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo size={48} />
            <h1 className="mt-3 text-lg font-semibold">x-noname</h1>
            <p className="text-sm text-muted-foreground">Merchant Portal</p>
          </div>
          <div className={className}>{children}</div>
        </div>
      </div>
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/10" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md space-y-6 text-center">
            <div className="mx-auto">
              <Logo size={72} />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Manage your payments in one place
            </h2>
            <p className="text-muted-foreground">
              Monitor transactions, create payment links, send invoices, and
              manage your team — all from a single dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
