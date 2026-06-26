"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="x-noname logo"
    >
      {/* Outer diamond */}
      <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor" />
      {/* Inner X mark */}
      <path
        d="M10 10L22 22M22 10L10 22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Accent dot */}
      <circle cx="22" cy="10" r="2" fill="white" />
    </svg>
  );
}
