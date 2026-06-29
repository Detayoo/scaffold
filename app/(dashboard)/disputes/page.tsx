"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { Filter } from "lucide-react";

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
import { DisputeDetailSheet } from "@/modals/DisputeDetailSheet";
import { getDisputesFn } from "@/services";
import { formatMoney } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { DisputeCase } from "@/types";

function DisputesContent() {
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState("");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["disputes", statusFilter, searchInput],
    queryFn: () => getDisputesFn({ reference: searchInput || undefined, status: statusFilter || undefined }),
  });

  const disputes = data?.data;

  const columns: Column<DisputeCase>[] = [
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
      cell: (r) => <span className="text-sm text-foreground">{r?.reason ?? "—"}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Disputes" description="Manage and respond to payment disputes" />
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
        emptyDescription={searchInput ? "Try a different search term" : "No disputes have been filed"}
        onRowClick={(r) => setDetailId(r?.id)}
      />

      <DisputeDetailSheet disputeId={detailId} onOpenChange={(o) => { if (!o) setDetailId(null); }} />
    </div>
  );
}

export default withSuspense(DisputesContent);
