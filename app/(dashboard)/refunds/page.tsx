"use client";

import { useCallback, useState, Suspense } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Trash2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { approveRefundFn, deleteRefundRequestFn, getRefundDetailsFn, getRefundsFn } from "@/services";
import { DataTable, type Column } from "@/components/DataTable";
import { referenceColumn, amountColumn, statusColumn, dateColumn } from "@/components/ColumnHelpers";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { DetailRow } from "@/components/DetailRow";
import { DetailSheet } from "@/components/DetailSheet";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { formatDate, formatMoney, toastMessage, extractError } from "@/utils";
import type { Refund, RefundDetails } from "@/types";
function RefundsContent() {
  const { merchant } = useAuth();
  const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage, setPerPage] = useQueryState("size", parseAsInteger.withDefault(10));
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["refunds", currentPage, perPage, searchInput, merchant?.id],
    queryFn: () =>
      getRefundsFn({
        page: currentPage,
        size: perPage,
        reference: searchInput || undefined,
        merchantId: merchant?.id,
      }),
    enabled: !!merchant?.id,
  });

  const {
    data: detailData,
    isPending: detailPending,
    isError: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["refund-detail", selectedId],
    queryFn: () => getRefundDetailsFn({ id: selectedId! }),
    enabled: !!selectedId,
  });

  const { mutateAsync: approveRefund, isPending: isApproving } = useMutation({
    mutationFn: approveRefundFn,
    onSuccess: () => {
      toastMessage("success", "Refund approved successfully");
      setApproveId(null);
      setDetailOpen(false);
      refetch();
    },
    onError: (err) => {
      toastMessage("error", extractError(err));
    },
  });

  const { mutateAsync: deleteRefund, isPending: isDeleting } = useMutation({
    mutationFn: deleteRefundRequestFn,
    onSuccess: () => {
      toastMessage("success", "Refund request deleted");
      setDeleteId(null);
      setDetailOpen(false);
      refetch();
    },
    onError: (err) => {
      toastMessage("error", extractError(err));
    },
  });

  const refunds = data?.data?.refunds;
  const refundDetail = detailData as RefundDetails | undefined;

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setCurrentPage(1);
  }, []);

  const handleRowClick = useCallback((r: Refund) => {
    setSelectedId(r.id);
    setDetailOpen(true);
  }, []);

  const columns: Column<Refund>[] = [
    referenceColumn((r) => r.reference),
    amountColumn((r) => r.amount),
    statusColumn((r) => r.status),
    {
      key: "type",
      header: "TYPE",
      className: "capitalize",
      cell: (r) => r.type,
    },
    dateColumn((r) => r.createdAt),
  ];

  const itemOffset = (currentPage - 1) * perPage;

  return (
    <div className="space-y-4">
      <PageHeader title="Refunds" description="Manage refund requests from your customers" />

      <SearchInput
        value={searchInput}
        onChange={setSearchInput}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        showClear={!!searchInput}
        placeholder="Search by reference..."
      />

      <DataTable
        columns={columns}
        data={refunds}
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
        emptyTitle="No refunds found"
        emptyDescription={searchInput ? "Try a different search term" : undefined}
      />

      <DetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Refund Details"
        isLoading={detailPending}
        isError={detailError || !detailData}
        onRetry={refetchDetail}
        errorMessage="Could not load refund details"
      >
          {(() => {
            const r = detailData?.data?.refund;
            if (!r) return null;
            const isPendingStatus = r.status?.toLowerCase() === "pending" || r.status?.toLowerCase() === "refund-pending";
            const isApproved = r.status?.toLowerCase() === "approved";

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Reference" value={r.reference} mono />
                  <DetailRow label="Status" value={<StatusBadge status={r.status} />} />
                  <DetailRow label="Amount" value={formatMoney(r.amount)} />
                  <DetailRow label="Type" value={r.type} capitalize />
                  <DetailRow label="Transaction Reference" value={r.transactionReference} mono className="col-span-2" />
                  <DetailRow label="Reason" value={r.reason ?? "—"} className="col-span-2" />
                  <DetailRow label="Date" value={formatDate(r.createdAt)} className="col-span-2" />
                </div>

                {(isPendingStatus || isApproved) && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      {isPendingStatus && (
                        <>
                          <Button
                            variant="default"
                           
                            className="flex-1 gap-2"
                            onClick={() => setApproveId(r.id)}
                            disabled={isApproving}
                          >
                            <CheckCircle2 className="size-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                           
                            className="flex-1 gap-2"
                            onClick={() => setDeleteId(r.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </Button>
                        </>
                      )}
                      {isApproved && (
                        <p className="w-full text-center text-sm text-muted-foreground">
                          This refund has been approved
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
      </DetailSheet>

      <ConfirmDialog
        open={!!approveId}
        onOpenChange={(open) => !open && setApproveId(null)}
        title="Approve Refund"
        description="Are you sure you want to approve this refund? This action cannot be undone."
        confirmLabel="Approve"
        variant="default"
        loading={isApproving}
        onConfirm={async () => {
          if (approveId) await approveRefund({ id: approveId });
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Refund Request"
        description="Are you sure you want to delete this refund request? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
        onConfirm={async () => {
          if (deleteId) await deleteRefund({ id: deleteId });
        }}
      />
    </div>
  );
}

export default function RefundsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <RefundsContent />
    </Suspense>
  );
}
