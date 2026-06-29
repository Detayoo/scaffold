"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Landmark } from "lucide-react";

import { getSettlementsFn, getBalancesFn } from "@/services";
import { DataTable, type Column } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatMoney, formatMoneyCompact } from "@/utils";
import type { SettlementBatch } from "@/types/finance";
import { withSuspense } from "@/components/withSuspense";

function SettlementsContent() {
  const router = useRouter();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [size, setSize] = useQueryState("size", parseAsInteger.withDefault(10));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["settlements", page, size, statusFilter],
    queryFn: () => getSettlementsFn({ status: statusFilter || undefined }),
  });

  const { data: balData, isPending: balPending, isError: balError, refetch: refetchBal } = useQuery({
    queryKey: ["settlement-balances"],
    queryFn: () => getBalancesFn({}),
  });

  const settlements = data?.data;
  const balances = balData?.data?.[0];

  const balanceItems = balances ? [
    { label: "Pending", value: balances.pendingAmountMinor },
    { label: "Available", value: balances.availableAmountMinor },
    { label: "Held", value: balances.heldAmountMinor },
    { label: "Settlement Payable", value: balances.settlementPayableAmountMinor },
    { label: "Paid", value: balances.paidAmountMinor },
  ] : [];

  const columns: Column<SettlementBatch>[] = [
    {
      key: "id",
      header: "ID",
      cell: (s) => <span className="text-sm text-foreground">{s?.id?.slice(0, 8)}...</span>,
    },
    {
      key: "channel",
      header: "Channel",
      cell: (s) => <span className="capitalize text-sm text-foreground">{s?.channel}</span>,
    },
    {
      key: "gross",
      header: "Gross",
      cell: (s) => <span className="text-sm text-foreground">{formatMoney(s?.grossAmountMinor)}</span>,
    },
    {
      key: "fee",
      header: "Fee",
      cell: (s) => <span className="text-sm text-foreground">{formatMoney(s?.feeAmountMinor)}</span>,
    },
    {
      key: "net",
      header: "Net",
      cell: (s) => <span className="text-sm text-foreground">{formatMoney(s?.netAmountMinor)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => <StatusBadge status={s?.status ?? ""} size="sm" />,
    },
    {
      key: "reconciliation",
      header: "Reconciliation",
      cell: (s) => <StatusBadge status={s?.reconciliationStatus ?? ""} size="sm" />,
    },
    {
      key: "date",
      header: "Date",
      cell: (s) => <span className="text-sm text-foreground">{formatDate(s?.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settlements" description="View and manage your settlement batches" />

      <AsyncContent isPending={balPending} isError={balError} onRetry={refetchBal} errorMessage="Failed to load balances">
        {balanceItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="size-4 text-muted-foreground" />
                Get merchant ledger-derived balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {balanceItems.map((b) => (
                  <div key={b.label}>
                    <p className="text-xs text-muted-foreground">{b.label}</p>
                    <p className="text-lg font-semibold mt-0.5">{formatMoneyCompact(b?.value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </AsyncContent>

      <DataTable
        columns={columns}
        data={settlements}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No settlements yet"
        emptyDescription="Settlement batches will appear here once payments are processed"
        onRowClick={(s) => router.push(`/settlements/${s?.id}`)}
      />
    </div>
  );
}

export default withSuspense(SettlementsContent);
