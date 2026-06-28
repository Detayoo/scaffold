"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Download, Filter } from "lucide-react";

import { getTransactionsFn, getTransactionDetailsFn, exportTransactionsFn } from "@/services";
import { DataTable, type Column } from "@/components/DataTable";
import { referenceColumn, amountColumn, statusColumn, dateColumn } from "@/components/ColumnHelpers";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { FilterModal } from "@/components/FilterModal";
import { DetailRow } from "@/components/DetailRow";
import { DetailSheet } from "@/components/DetailSheet";
import { formatDate, formatMoney, toastMessage, extractError } from "@/utils";
import { ErrorState } from "@/components/ErrorState";
import { withSuspense } from "@/components/withSuspense";
import { DatePicker } from "@/components/DatePicker";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import type { Transaction, TransactionDetails } from "@/types";
function TransactionsContent() {
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage, setPerPage] = useQueryState("size", parseAsInteger.withDefault(10));
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [reference, setReference] = useQueryState("ref", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [localStatusFilter, setLocalStatusFilter] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useQueryState("from", parseAsString.withDefault(""));
  const [exportEndDate, setExportEndDate] = useQueryState("to", parseAsString.withDefault(""));
  const [exportStatus, setExportStatus] = useQueryState("estatus", parseAsString.withDefault(""));
  const [exporting, setExporting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["transactions", currentPage, perPage, reference, statusFilter],
    queryFn: () => getTransactionsFn({ page: currentPage, size: perPage, reference: reference || undefined, status: statusFilter || undefined }),
  });

  const {
    data: detailData,
    isPending: detailPending,
    isError: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["transaction-detail", selectedId],
    queryFn: () => getTransactionDetailsFn(selectedId!),
    enabled: !!selectedId,
  });

  const transactionDetail = detailData as TransactionDetails | undefined;
  const transactions = data?.data?.transactions;

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
    referenceColumn((tx) => tx.reference),
    amountColumn((tx) => tx.amount),
    statusColumn((tx) => tx.status),
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
    dateColumn((tx) => tx.createdAt),
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
        <PageHeader title="Transactions" description="View and manage all your transactions" />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            <Filter className="size-4" />
            Filter
          </Button>
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        showClear={!!reference}
        placeholder="Search by reference..."
      />

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

      <FilterModal
        open={filterOpen}
        onOpenChange={(open) => {
          setFilterOpen(open);
          if (open) setLocalStatusFilter(statusFilter);
        }}
        onApply={() => {
          setStatusFilter(localStatusFilter);
          setCurrentPage(1);
          setFilterOpen(false);
        }}
        onClear={() => {
          setLocalStatusFilter("");
          setStatusFilter("");
          setCurrentPage(1);
          setFilterOpen(false);
        }}
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Status</label>
          <Select value={localStatusFilter} onValueChange={setLocalStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FilterModal>

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
            <DatePicker value={exportStartDate ? new Date(exportStartDate) : undefined} onChange={(d) => setExportStartDate(d ? d.toISOString().split("T")[0] : "")} label="Start Date" />
            <DatePicker value={exportEndDate ? new Date(exportEndDate) : undefined} onChange={(d) => setExportEndDate(d ? d.toISOString().split("T")[0] : "")} label="End Date" />
          </div>
          <Button variant="default" className="w-full" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </ResponsiveModal>

      <DetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Transaction Details"
        isLoading={detailPending}
        isError={detailError || !transactionDetail?.data?.transaction}
        onRetry={refetchDetail}
        errorMessage="Could not load transaction details"
      >
          {(() => {
            const tx = transactionDetail?.data?.transaction;
            if (!tx) return null;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Reference" value={tx.reference} mono />
                  <DetailRow label="Status" value={<StatusBadge status={tx.status} size="sm" />} />
                  <DetailRow label="Amount" value={formatMoney(tx.amount)} />
                  {tx.fee !== undefined && (
                    <DetailRow label="Fee" value={formatMoney(tx.fee)} />
                  )}
                  {tx.netAmount !== undefined && (
                    <DetailRow label="Net Amount" value={formatMoney(tx.netAmount)} />
                  )}
                  <DetailRow label="Currency" value={tx.currency} />
                  {tx.channel && (
                    <DetailRow label="Channel" value={tx.channel} capitalize />
                  )}
                  {tx.cardScheme && (
                    <DetailRow label="Card Scheme" value={tx.cardScheme} />
                  )}
                  <DetailRow label="Customer" value={tx.customerName ?? tx.customerEmail ?? "—"} className="col-span-2" />
                  <DetailRow label="Date" value={formatDate(tx.createdAt)} className="col-span-2" />
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="size-4" />
                    Download Receipt
                  </Button>
                </div>
              </div>
            );
          })()}
      </DetailSheet>
    </div>
  );
}

export default withSuspense(TransactionsContent);
