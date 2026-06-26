"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter, Search, X } from "lucide-react";

import { getTransactionsFn, getTransactionDetailsFn, exportTransactionsFn } from "@/services";
import { DataTable, type Column } from "@/components/DataTable";
import { DateInput } from "@/components/DateInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { formatDate, formatMoney, naira, toastMessage, extractError } from "@/utils";
import type { Transaction, TransactionDetails } from "@/types";

export default function TransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [reference, setReference] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [exporting, setExporting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["transactions", currentPage, perPage, reference, statusFilter],
    queryFn: () => getTransactionsFn({ page: currentPage, size: perPage, reference: reference || undefined, status: statusFilter || undefined }),
  });

  const {
    data: detailData,
    isFetching: detailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["transaction-detail", selectedId],
    queryFn: () => getTransactionDetailsFn(selectedId!),
    enabled: !!selectedId,
  });

  const transactions = data?.data?.transactions ?? [];
  const transactionDetail = detailData as TransactionDetails | undefined;

  const handleSearch = useCallback(() => {
    setReference(searchInput);
    setCurrentPage(1);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setReference("");
    setCurrentPage(1);
  }, []);

  const handleRowClick = useCallback((tx: Transaction) => {
    setSelectedId(tx.id);
    setDetailOpen(true);
  }, []);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await exportTransactionsFn({
        startDate: exportStartDate || undefined,
        endDate: exportEndDate || undefined,
        status: exportStatus || undefined,
      });
      toastMessage("success", "Export initiated. You will receive an email when ready.");
      setExportOpen(false);
    } catch (error) {
      toastMessage("error", extractError(error));
    } finally {
      setExporting(false);
    }
  }, [exportStartDate, exportEndDate, exportStatus]);

  const columns: Column<Transaction>[] = [
    {
      key: "reference",
      header: "Reference",
      cell: (tx) => <span className="font-mono text-xs">{tx.reference}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (tx) => (
        <span className="font-medium">
          {naira}
          {formatMoney(tx.amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (tx) => <StatusBadge status={tx.status} />,
    },
    {
      key: "customer",
      header: "Customer",
      className: "hidden md:table-cell",
      cell: (tx) => (
        <span className="text-muted-foreground">
          {tx.customerName ?? tx.customerEmail ?? "—"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      className: "text-right",
      cell: (tx) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(tx.createdAt)}
        </span>
      ),
    },
  ];

  const itemOffset = (currentPage - 1) * perPage;

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
    { value: "pending", label: "Pending" },
    { value: "abandoned", label: "Abandoned" },
    { value: "refunded", label: "Refunded" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-medium text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground">View and manage all your transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)}>
            <Filter className="size-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-8"
          />
        </div>
        <Button variant="default" size="sm" onClick={handleSearch}>
          Search
        </Button>
        {reference && (
          <Button variant="ghost" size="sm" onClick={handleClearSearch}>
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        isPending={isPending}
        isError={isError}
        error={error}
        onRetry={refetch}
        pageCount={data?.data?.totalPages}
        currentPage={currentPage - 1}
        perPage={perPage}
        totalRecords={data?.data?.totalRecords}
        itemOffset={itemOffset}
        onPageChange={(selected) => setCurrentPage(selected + 1)}
        onPerPageChange={(size) => setPerPage(size)}
        isFetching={isFetching}
        onRowClick={handleRowClick}
        emptyTitle="No transactions found"
        emptyDescription={reference ? "Try a different search term" : undefined}
      />

      <ResponsiveModal open={filterOpen} onOpenChange={setFilterOpen} title="Filter Transactions">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setCurrentPage(1);
                setFilterOpen(false);
              }}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("");
                setCurrentPage(1);
                setFilterOpen(false);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      <ResponsiveModal open={exportOpen} onOpenChange={setExportOpen} title="Export Transactions">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              value={exportStatus}
              onChange={(e) => setExportStatus(e.target.value)}
              className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <DateInput value={exportStartDate} onChange={(v) => setExportStartDate(v)} label="Start Date" />
            </div>
            <div className="space-y-1.5">
              <DateInput value={exportEndDate} onChange={(v) => setExportEndDate(v)} label="End Date" />
            </div>
          </div>
          <Button variant="default" size="sm" className="w-full" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveSheet open={detailOpen} onOpenChange={setDetailOpen} title="Transaction Details">
        {detailLoading ? (
          <LoadingState variant="skeleton" />
        ) : !transactionDetail?.data?.transaction ? (
          <ErrorState message="Could not load transaction details" onRetry={refetchDetail} />
        ) : (
          (() => {
            const tx = transactionDetail.data.transaction;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Reference</p>
                    <p className="font-mono text-sm font-medium">{tx.reference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <StatusBadge status={tx.status} size="sm" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-sm font-medium">
                      {naira}
                      {formatMoney(tx.amount)}
                    </p>
                  </div>
                  {tx.fee !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground">Fee</p>
                      <p className="text-sm">
                        {naira}
                        {formatMoney(tx.fee)}
                      </p>
                    </div>
                  )}
                  {tx.netAmount !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground">Net Amount</p>
                      <p className="text-sm font-medium">
                        {naira}
                        {formatMoney(tx.netAmount)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Currency</p>
                    <p className="text-sm">{tx.currency}</p>
                  </div>
                  {tx.channel && (
                    <div>
                      <p className="text-xs text-muted-foreground">Channel</p>
                      <p className="text-sm capitalize">{tx.channel}</p>
                    </div>
                  )}
                  {tx.cardScheme && (
                    <div>
                      <p className="text-xs text-muted-foreground">Card Scheme</p>
                      <p className="text-sm">{tx.cardScheme}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="text-sm">{tx.customerName ?? tx.customerEmail ?? "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="size-4" />
                    Download Receipt
                  </Button>
                </div>
              </div>
            );
          })()
        )}
      </ResponsiveSheet>
    </div>
  );
}
