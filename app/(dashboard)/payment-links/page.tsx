"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { Search, Filter, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/FormField";
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterModal } from "@/components/FilterModal";
import { PaymentLinkDetailSheet } from "@/modals/PaymentLinkDetailSheet";
import { CreatePaymentLinkModal } from "@/modals/CreatePaymentLinkModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { getPaylinksFn, updatePaylinkStatusFn } from "@/services";
import { toastMessage, extractError, formatMoney } from "@/utils";
import { withSuspense } from "@/components/withSuspense";

function PaylinksContent() {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"active" | "inactive">("active");
  const [detailRef, setDetailRef] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState("");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["paylinks", statusFilter, search],
    queryFn: () => getPaylinksFn({ reference: search || undefined, status: statusFilter || undefined }),
  });

  const paylinks = data?.data;

  const { mutateAsync: updateStatus, isPending: updating } = useMutation({
    mutationFn: updatePaylinkStatusFn,
    onSuccess: () => {
      toastMessage("success", confirmAction === "inactive" ? "Link deactivated" : "Link activated");
      setConfirmId(null);
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const columns: Column<any>[] = [
    {
      key: "reference",
      header: "Reference",
      cell: (pl) => <span className="text-sm text-foreground">{pl?.reference}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (pl) => <span className="text-sm text-foreground">{formatMoney(pl?.amount)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (pl) => <StatusBadge status={pl?.status} size="sm" />,
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      cell: (pl) => (
        pl?.status === "active" ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setConfirmId(pl?.id); setConfirmAction("inactive"); }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            Deactivate
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setConfirmId(pl?.id); setConfirmAction("active"); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Activate
          </button>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Payment Links" description="Create and manage shareable payment links" />
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Create Link
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" className="size-10" onClick={() => { setLocalStatus(statusFilter); setFilterOpen(true); }}>
          <Filter className="size-4" />
        </Button>
      </div>

      <FilterModal
        open={filterOpen}
        onOpenChange={(open) => { setFilterOpen(open); if (open) setLocalStatus(statusFilter); }}
        onApply={() => { setStatusFilter(localStatus); setFilterOpen(false); }}
        onClear={() => { setLocalStatus(""); setStatusFilter(""); setFilterOpen(false); }}
      >
        <FormField label="Status">
          <Select value={localStatus} onValueChange={setLocalStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FilterModal>

      <DataTable
        columns={columns}
        data={paylinks}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        emptyTitle="No payment links yet"
        emptyDescription="Create your first payment link to start collecting payments."
        emptyAction={{ label: "Create Link", onClick: () => setCreateOpen(true) }}
        onRowClick={(pl) => setDetailRef(pl?.reference)}
      />

      <CreatePaymentLinkModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={() => refetch()} />
      <PaymentLinkDetailSheet reference={detailRef} onOpenChange={(o) => { if (!o) setDetailRef(null); }} />

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(o) => { if (!o) setConfirmId(null); }}
        title={confirmAction === "inactive" ? "Deactivate Link" : "Activate Link"}
        description={`Are you sure you want to ${confirmAction === "inactive" ? "deactivate" : "activate"} this payment link?`}
        confirmLabel={confirmAction === "inactive" ? "Deactivate" : "Activate"}
        variant={confirmAction === "inactive" ? "destructive" : "default"}
        onConfirm={() => confirmId && updateStatus({ id: confirmId, status: confirmAction })}
        loading={updating}
      />
    </div>
  );
}

export default withSuspense(PaylinksContent);
