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
  const textFill = isDark ? "#171717" : "#ffffff";
  const letter = APP_NAME.charAt(0).toUpperCase();

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
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fill={textFill}
        fontSize="16"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {letter}
      </text>
    </svg>
  );
}
