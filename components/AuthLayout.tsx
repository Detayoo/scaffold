"use client";

import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

function PaymentIllustration() {
  return (
    <svg
      viewBox="0 0 600 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 size-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.04" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.06" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="card1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.10" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.20" />
        </linearGradient>
        <linearGradient id="card2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background gradient */}
      <rect width="600" height="800" fill="url(#g1)" />

      {/* Large geometric circle */}
      <circle cx="300" cy="400" r="320" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" fill="none" />
      <circle cx="300" cy="400" r="240" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1" fill="none" />
      <circle cx="300" cy="400" r="160" stroke="currentColor" strokeOpacity="0.03" strokeWidth="1" fill="none" />

      {/* Grid pattern */}
      {[-200, -100, 0, 100, 200, 300, 400].map((x, i) => (
        <line key={`gx${i}`} x1={300 + x} y1={100} x2={300 + x} y2={700} stroke="currentColor" strokeOpacity="0.03" strokeWidth="0.5" />
      ))}
      {[150, 250, 350, 450, 550, 650].map((y, i) => (
        <line key={`gy${i}`} x1={50} y1={y} x2={550} y2={y} stroke="currentColor" strokeOpacity="0.03" strokeWidth="0.5" />
      ))}

      {/* Card 1 — main card */}
      <g transform="translate(100, 220)">
        <rect width="400" height="240" rx="16" fill="url(#card1)" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
        <rect x="24" y="24" width="48" height="36" rx="6" fill="currentColor" fillOpacity="0.08" />
        <rect x="80" y="24" width="80" height="36" rx="6" fill="currentColor" fillOpacity="0.04" />
        <rect x="24" y="140" width="160" height="24" rx="4" fill="currentColor" fillOpacity="0.06" />
        <rect x="24" y="172" width="200" height="24" rx="4" fill="currentColor" fillOpacity="0.04" />
        <rect x="300" y="160" width="76" height="48" rx="8" fill="currentColor" fillOpacity="0.08" />
        <circle cx="340" cy="180" r="4" fill="currentColor" fillOpacity="0.15" />
        <rect x="24" y="80" width="100" height="8" rx="4" fill="currentColor" fillOpacity="0.05" />
      </g>

      {/* Card 2 — behind card */}
      <g transform="translate(140, 280) rotate(-6)">
        <rect width="400" height="240" rx="16" fill="url(#card2)" stroke="currentColor" strokeOpacity="0.10" strokeWidth="1" />
        <rect x="24" y="24" width="36" height="36" rx="18" fill="currentColor" fillOpacity="0.06" />
        <rect x="24" y="140" width="120" height="20" rx="4" fill="currentColor" fillOpacity="0.05" />
        <rect x="24" y="168" width="180" height="20" rx="4" fill="currentColor" fillOpacity="0.03" />
      </g>

      {/* Small floating card */}
      <g transform="translate(390, 160) rotate(8)">
        <rect width="160" height="100" rx="12" fill="url(#card1)" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
        <rect x="12" y="12" width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.06" />
        <rect x="12" y="60" width="80" height="10" rx="3" fill="currentColor" fillOpacity="0.05" />
        <rect x="12" y="76" width="120" height="10" rx="3" fill="currentColor" fillOpacity="0.03" />
      </g>

      {/* Chart bar 1 */}
      <g transform="translate(100, 530)">
        <rect x="0" y="40" width="40" height="60" rx="4" fill="currentColor" fillOpacity="0.08" />
        <rect x="50" y="10" width="40" height="90" rx="4" fill="currentColor" fillOpacity="0.12" />
        <rect x="100" y="30" width="40" height="70" rx="4" fill="currentColor" fillOpacity="0.06" />
        <rect x="150" y="0" width="40" height="100" rx="4" fill="currentColor" fillOpacity="0.15" />
        <rect x="200" y="20" width="40" height="80" rx="4" fill="currentColor" fillOpacity="0.09" />
        <rect x="250" y="45" width="40" height="55" rx="4" fill="currentColor" fillOpacity="0.07" />
        <line x1="0" y1="0" x2="0" y2="100" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
        <line x1="0" y1="100" x2="290" y2="100" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
      </g>

      {/* Trend line */}
      <g transform="translate(370, 530)">
        <rect width="130" height="70" rx="8" fill="url(#card1)" stroke="currentColor" strokeOpacity="0.10" strokeWidth="1" />
        <polyline points="12,50 30,40 50,45 70,25 90,30 110,15" stroke="currentColor" strokeOpacity="0.20" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="110" cy="15" r="3" fill="currentColor" fillOpacity="0.25" />
        <rect x="12" y="10" width="50" height="6" rx="2" fill="currentColor" fillOpacity="0.06" />
      </g>

      {/* Floating dots */}
      <circle cx="150" cy="180" r="3" fill="currentColor" fillOpacity="0.08" />
      <circle cx="470" cy="400" r="2" fill="currentColor" fillOpacity="0.06" />
      <circle cx="100" cy="450" r="2.5" fill="currentColor" fillOpacity="0.07" />
      <circle cx="480" cy="520" r="2" fill="currentColor" fillOpacity="0.05" />
      <circle cx="200" cy="150" r="1.5" fill="currentColor" fillOpacity="0.06" />
      <circle cx="450" cy="180" r="2" fill="currentColor" fillOpacity="0.07" />

      {/* Glow strip */}
      <rect x="50" y="490" width="500" height="60" rx="30" fill="url(#glow)" />

      {/* Small decorative elements */}
      <g transform="translate(80, 640)">
        <rect width="80" height="24" rx="6" stroke="currentColor" strokeOpacity="0.10" strokeWidth="1" fill="none" />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.10" />
      </g>
      <g transform="translate(440, 640)">
        <rect width="80" height="24" rx="6" stroke="currentColor" strokeOpacity="0.10" strokeWidth="1" fill="none" />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.10" />
      </g>
    </svg>
  );
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh w-full">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background text-lg font-bold">
              X
            </div>
            <div>
              <h1 className="text-lg font-semibold">x-noname</h1>
              <p className="text-sm text-muted-foreground">
                Merchant Portal
              </p>
            </div>
          </div>
          <div className={className}>{children}</div>
        </div>
      </div>
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <PaymentIllustration />
      </div>
    </div>
  );
}
