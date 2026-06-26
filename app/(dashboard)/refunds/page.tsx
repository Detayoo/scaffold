"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Trash2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { approveRefundFn, deleteRefundRequestFn, getRefundDetailsFn, getRefundsFn } from "@/services";
import { DataTable, type Column } from "@/components/DataTable";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { formatDate, formatMoney, toastMessage, extractError } from "@/utils";
import type { Refund, RefundDetails } from "@/types";

export default function RefundsPage() {
  const { merchant } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [reference, setReference] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["refunds", currentPage, perPage, reference, merchant?.id],
    queryFn: () =>
      getRefundsFn({
        page: currentPage,
        size: perPage,
        reference: reference || undefined,
        merchantId: merchant?.id,
      }),
    enabled: !!merchant?.id,
  });

  const {
    data: detailData,
    isFetching: detailLoading,
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
    setReference(searchInput);
    setCurrentPage(1);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setReference("");
    setCurrentPage(1);
  }, []);

  const handleRowClick = useCallback((r: Refund) => {
    setSelectedId(r.id);
    setDetailOpen(true);
  }, []);

  const columns: Column<Refund>[] = [
    {
      key: "reference",
      header: "Reference",
      cell: (r) => <span className="font-mono text-xs">{r.reference}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (r) => (
        <span className="font-medium">
          {formatMoney(r.amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "type",
      header: "Type",
      className: "capitalize",
      cell: (r) => r.type,
    },
    {
      key: "date",
      header: "Date",
      className: "text-right",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
  ];

  const itemOffset = (currentPage - 1) * perPage;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-medium text-foreground">Refunds</h1>
        <p className="text-sm text-muted-foreground">Manage refund requests from your customers</p>
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
        emptyDescription={reference ? "Try a different search term" : undefined}
      />

      <ResponsiveSheet open={detailOpen} onOpenChange={setDetailOpen} title="Refund Details">
        {detailLoading ? (
          <LoadingState />
        ) : !refundDetail?.data?.refund ? (
          <ErrorState message="Could not load refund details" onRetry={refetchDetail} />
        ) : (
          (() => {
            const r = refundDetail.data.refund;
            const isPendingStatus = r.status?.toLowerCase() === "pending" || r.status?.toLowerCase() === "refund-pending";
            const isApproved = r.status?.toLowerCase() === "approved";

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Reference</p>
                    <p className="font-mono text-sm font-medium">{r.reference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-sm font-medium">
                      {formatMoney(r.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm capitalize">{r.type}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Transaction Reference</p>
                    <p className="font-mono text-sm">{r.transactionReference}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Reason</p>
                    <p className="text-sm">{r.reason ?? "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm">{formatDate(r.createdAt)}</p>
                  </div>
                </div>

                {(isPendingStatus || isApproved) && (
                  <>
                    <Separator />
                    <div className="flex gap-2">
                      {isPendingStatus && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={() => setApproveId(r.id)}
                            disabled={isApproving}
                          >
                            <CheckCircle2 className="size-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
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
          })()
        )}
      </ResponsiveSheet>

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
