"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { Filter, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterModal } from "@/components/FilterModal";
import { AdminRefundDetailSheet } from "@/modals/AdminRefundDetailSheet";
import { CreateAdminRefundModal } from "@/modals/CreateAdminRefundModal";
import { getAdminRefundsFn } from "@/services";
import { formatMoney } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { Refund } from "@/types";

function AdminRefundsContent() {
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailRefund, setDetailRefund] = useState<Refund | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-refunds", statusFilter, searchInput],
    queryFn: () => getAdminRefundsFn({ reference: searchInput || undefined, status: statusFilter || undefined }),
  });

  const refunds = data?.data;

  const columns: Column<Refund>[] = [
    {
      key: "reference",
      header: "Reference",
      cell: (r) => <span className="text-sm text-foreground">{r?.reference}</span>,
    },
    {
      key: "amountMinor",
      header: "Amount",
      cell: (r) => <span className="text-sm text-foreground">{formatMoney(r?.amountMinor)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <StatusBadge status={r?.status} size="sm" />,
    },
    {
      key: "reason",
      header: "Reason",
      cell: (r) => <span className="text-sm text-muted-foreground">{r?.reason ?? "—"}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Refunds" description="Manage refunds across all merchants" />
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Create Refund
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
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FilterModal>

      <DataTable
        columns={columns}
        data={refunds}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        emptyTitle="No refunds found"
        emptyDescription={searchInput ? "Try a different search term" : "No refunds across all merchants"}
        onRowClick={(r) => setDetailRefund(r)}
      />

      <CreateAdminRefundModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={() => refetch()} />
      <AdminRefundDetailSheet refund={detailRefund} onOpenChange={(o) => { if (!o) setDetailRefund(null); }} onSuccess={() => refetch()} />
    </div>
  );
}

export default withSuspense(AdminRefundsContent);
