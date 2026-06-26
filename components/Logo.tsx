"use client";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const boxFill = isDark ? "#ffffff" : "#171717";
  const markStroke = isDark ? "#171717" : "#ffffff";

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
      <rect x="2" y="2" width="28" height="28" rx="7" fill={boxFill} />
      <path
        d="M10 10L22 22M22 10L10 22"
        stroke={markStroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="10" r="2" fill={markStroke} />
    </svg>
  );
}
