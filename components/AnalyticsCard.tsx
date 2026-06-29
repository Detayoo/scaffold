"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/CountUp";

interface AnalyticsCardProps {
  icon: LucideIcon;
  label: string;
  value?: number | string | null;
  compact?: boolean;
  mono?: boolean;
}

export function AnalyticsCard({ icon: Icon, label, value, compact, mono }: AnalyticsCardProps) {
  const displayValue = () => {
    if (value === undefined || value === null) return "—";

    if (typeof value === "string") return value;

    if (compact) {
      return <CountUp end={value} />;
    }
    return <CountUp end={value} />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={mono ? "text-2xl font-semibold font-mono" : "text-2xl font-semibold"}>
          {displayValue()}
        </p>
      </CardContent>
    </Card>
  );
}
