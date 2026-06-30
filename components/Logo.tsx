"use client";

import { useTheme } from "@/components/theme-provider";
import { APP_NAME } from "@/config";
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
      aria-label={`${APP_NAME} logo`}
    >
      <rect x="2" y="2" width="28" height="28" rx="7" fill={boxFill} />
      <path
        d="M8 24V8L16 18L24 8V24"
        stroke={markStroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
