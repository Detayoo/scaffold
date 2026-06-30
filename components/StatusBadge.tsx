"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Ban,
  type LucideIcon,
} from "lucide-react";

type StatusVariant =
  | "success"
  | "error"
  | "pending"
  | "warning"
  | "info"
  | "neutral";

const statusConfig: Record<
  string,
  { variant: StatusVariant; label: string }
> = {
  paid: { variant: "success", label: "Paid" },
  success: { variant: "success", label: "Success" },
  fulfilled: { variant: "success", label: "Fulfilled" },
  active: { variant: "success", label: "Active" },
  approved: { variant: "success", label: "Approved" },
  credit: { variant: "success", label: "Credit" },
  overpayment: { variant: "success", label: "Overpayment" },
  purchased: { variant: "success", label: "Purchased" },
  "merchant-approved": { variant: "success", label: "Merchant Approved" },
  "platform-approved-refund-complete": {
    variant: "success",
    label: "Completed",
  },
  failed: { variant: "error", label: "Failed" },
  abandoned: { variant: "error", label: "Abandoned" },
  refunded: { variant: "error", label: "Refunded" },
  debit: { variant: "error", label: "Debit" },
  expired: { variant: "error", label: "Expired" },
  closed: { variant: "error", label: "Closed" },
  suspended: { variant: "error", label: "Suspended" },
  pending: { variant: "pending", label: "Pending" },
  "refund-pending": { variant: "pending", label: "Refund Pending" },
  "partially-paid": { variant: "pending", label: "Partially Paid" },
  "payment-pending": { variant: "pending", label: "Payment Pending" },
  initiated: { variant: "pending", label: "Initiated" },
  created: { variant: "pending", label: "Created" },
  draft: { variant: "neutral", label: "Draft" },
  overdue: { variant: "warning", label: "Overdue" },
  cancelled: { variant: "neutral", label: "Cancelled" },
  inactive: { variant: "neutral", label: "Inactive" },
  accepted: { variant: "success", label: "Accepted" },
  revoked: { variant: "error", label: "Revoked" },
  queued: { variant: "pending", label: "Queued" },
};

const variantStyles: Record<StatusVariant, string> = {
  success:
    "bg-success/10 text-success border-success/20 [&_svg]:text-success",
  error: "bg-destructive/10 text-destructive border-destructive/20 [&_svg]:text-destructive",
  pending:
    "bg-warning/10 text-warning border-warning/20 [&_svg]:text-warning",
  warning:
    "bg-warning/10 text-warning border-warning/20 [&_svg]:text-warning",
  info: "bg-info/10 text-info border-info/20 [&_svg]:text-info",
  neutral:
    "bg-muted text-muted-foreground border-border [&_svg]:text-muted-foreground",
};

const variantIcons: Record<StatusVariant, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  pending: Clock,
  warning: AlertTriangle,
  info: RefreshCw,
  neutral: Ban,
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({
  status,
  className,
  size = "md",
}: StatusBadgeProps) {
  const normalized = status?.toLowerCase() ?? "";
  const config = statusConfig[normalized] ?? {
    variant: "neutral" as StatusVariant,
    label: status ?? "Unknown",
  };

  const Icon = variantIcons[config.variant];
  const sizeStyles = {
    sm: "text-[11px] gap-1 px-1.5 py-0.5",
    md: "text-xs gap-1.5 px-2 py-0.5",
    lg: "text-sm gap-1.5 px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        variantStyles[config.variant],
        sizeStyles[size],
        className
      )}
    >
      <Icon className={cn(size === "sm" ? "size-3" : "size-3.5")} />
      {config.label}
    </span>
  );
}
