import type { ReactNode } from "react";
import type { Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatMoney } from "@/utils";

export function referenceColumn<T>(cell: (item: T) => string): Column<T> {
  return {
    key: "reference",
    header: "Reference",
    cell: (item: T) => <span className="font-mono text-xs">{cell(item)}</span>,
  };
}

export function amountColumn<T>(cell: (item: T) => number, currency?: (item: T) => string): Column<T> {
  return {
    key: "amount",
    header: "Amount",
    cell: (item: T) => (
      <span className="font-medium">
        {currency ? `${currency(item)} ` : ""}{formatMoney(cell(item))}
      </span>
    ),
  };
}

export function statusColumn<T>(cell: (item: T) => string): Column<T> {
  return {
    key: "status",
    header: "Status",
    cell: (item: T) => <StatusBadge status={cell(item)} />,
  };
}

export function dateColumn<T>(cell: (item: T) => string): Column<T> {
  return {
    key: "date",
    header: "Date",
    cell: (item: T) => (
      <span className="text-xs text-foreground">{formatDate(cell(item))}</span>
    ),
  };
}

export function actionsColumn<T>(render: (item: T) => ReactNode): Column<T> {
  return {
    key: "actions",
    header: "",
    className: "w-10",
    cell: (item: T) => render(item),
  };
}
