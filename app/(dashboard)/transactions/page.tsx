"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { Filter, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/FormField";
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterModal } from "@/components/FilterModal";
import { ExportModal } from "@/components/ExportModal";
import { TransactionDetailSheet } from "@/modals/TransactionDetailSheet";
import { getTransactionsFn } from "@/services";
import { formatMoney, formatDate } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { Transaction } from "@/types";

function TransactionsContent() {
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [channelFilter, setChannelFilter] = useQueryState("channel", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [detailRef, setDetailRef] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState("");
  const [localChannel, setLocalChannel] = useState("");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["transactions", statusFilter, channelFilter, searchInput],
    queryFn: () =>
      getTransactionsFn({
        reference: searchInput || undefined,
        status: statusFilter || undefined,
        channel: channelFilter || undefined,
      }),
  });

  const transactions = data?.data;

  const columns: Column<Transaction>[] = [
    {
      key: "reference",
      header: "Reference",
      cell: (tx) => <span className="text-sm text-foreground">{tx?.reference}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (tx) => <span className="text-sm text-foreground">{tx?.currency} {formatMoney(tx?.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (tx) => <StatusBadge status={tx?.status} size="sm" />,
    },
    {
      key: "channel",
      header: "Channel",
      cell: (tx) => <span className="text-sm text-foreground capitalize">{tx?.channel}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      cell: (tx) => (
        <span className="text-sm text-foreground">
          {tx?.customer?.name ?? tx?.customer?.email ?? "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      cell: (tx) => (
        <span className="text-xs text-muted-foreground">{tx?.created_at ? formatDate(tx.created_at) : "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Transactions" description="View and search all your transactions" />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={() => {}}
          onClear={() => setSearchInput("")}
          showClear={!!searchInput}
          placeholder="Search by reference..."
          className="flex-1"
        />
        <Button variant="outline" className="size-10" onClick={() => { setLocalStatus(statusFilter); setLocalChannel(channelFilter); setFilterOpen(true); }}>
          <Filter className="size-4" />
        </Button>
      </div>

      <FilterModal
        open={filterOpen}
        onOpenChange={(open) => { setFilterOpen(open); if (open) { setLocalStatus(statusFilter); setLocalChannel(channelFilter); } }}
        onApply={() => { setStatusFilter(localStatus); setChannelFilter(localChannel); setFilterOpen(false); }}
        onClear={() => { setLocalStatus(""); setLocalChannel(""); setStatusFilter(""); setChannelFilter(""); setFilterOpen(false); }}
      >
        <div className="space-y-4">
          <FormField label="Status">
            <Select value={localStatus} onValueChange={setLocalStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All statuses</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="requires_action">Requires Action</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Channel">
            <Select value={localChannel} onValueChange={setLocalChannel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All channels</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FilterModal>

      <DataTable
        columns={columns}
        data={transactions}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        emptyTitle="No transactions found"
        emptyDescription={searchInput ? "Try a different search term" : "No transactions yet"}
        onRowClick={(tx) => setDetailRef(tx?.reference)}
      />

      <ExportModal open={exportOpen} onOpenChange={setExportOpen} exportType="transactions" label="Transactions" />

      <TransactionDetailSheet reference={detailRef} onOpenChange={(o) => { if (!o) setDetailRef(null); }} />
    </div>
  );
}

export default withSuspense(TransactionsContent);
