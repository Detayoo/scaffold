"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/CountUp";
import { formatMoney, formatMoneyCompact } from "@/utils";

interface AnalyticsCardProps {
  icon: LucideIcon;
  label: string;
  value?: number | string | null;
  compact?: boolean;
  mono?: boolean;
}

export function AnalyticsCard({ icon: Icon, label, value, compact, mono }: AnalyticsCardProps) {
  const renderValue = () => {
    if (value === undefined || value === null) return "—";
    if (typeof value === "string") return value;
    if (compact) return <>{formatMoneyCompact(value)}</>;
    return <>{formatMoney(value)}</>;
  };

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={mono ? "text-2xl font-semibold font-mono" : "text-2xl font-semibold"}>
          {renderValue()}
        </p>
      </CardContent>
    </Card>
  );
}
