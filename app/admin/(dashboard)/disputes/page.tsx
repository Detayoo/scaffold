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
import { AdminDisputeDetailSheet } from "@/modals/AdminDisputeDetailSheet";
import { CreateAdminDisputeModal } from "@/modals/CreateAdminDisputeModal";
import { getAdminDisputesFn } from "@/services";
import { formatMoney } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { DisputeCase } from "@/types";

function AdminDisputesContent() {
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailDispute, setDetailDispute] = useState<DisputeCase | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-disputes", statusFilter, searchInput],
    queryFn: () => getAdminDisputesFn({ reference: searchInput || undefined, status: statusFilter || undefined }),
  });

  const disputes = data?.data;

  const columns: Column<DisputeCase>[] = [
    {
      key: "reference",
      header: "Reference",
      cell: (d) => <span className="text-sm text-foreground">{d?.reference}</span>,
    },
    {
      key: "amountMinor",
      header: "Amount",
      cell: (d) => <span className="text-sm text-foreground">{formatMoney(d?.amountMinor)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (d) => <StatusBadge status={d?.status} size="sm" />,
    },
    {
      key: "reason",
      header: "Reason",
      cell: (d) => <span className="text-sm text-muted-foreground">{d?.reason ?? "—"}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Disputes" description="Manage disputes across all merchants" />
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Open Dispute
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
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="evidence_required">Evidence Required</SelectItem>
              <SelectItem value="evidence_submitted">Evidence Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FilterModal>

      <DataTable
        columns={columns}
        data={disputes}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        emptyTitle="No disputes found"
        emptyDescription={searchInput ? "Try a different search term" : "No disputes across all merchants"}
        onRowClick={(d) => setDetailDispute(d)}
      />

      <CreateAdminDisputeModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={() => refetch()} />
      <AdminDisputeDetailSheet dispute={detailDispute} onOpenChange={(o) => { if (!o) setDetailDispute(null); }} onSuccess={() => refetch()} />
    </div>
  );
}

export default withSuspense(AdminDisputesContent);
