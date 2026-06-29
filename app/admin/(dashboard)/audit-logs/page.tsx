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
import { FilterModal } from "@/components/FilterModal";
import { getAuditLogsFn } from "@/services";
import { formatDate } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { AuditLogEntry } from "@/types";

function AuditLogsContent() {
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [actionFilter, setActionFilter] = useQueryState("action", parseAsString.withDefault(""));
  const [targetFilter, setTargetFilter] = useQueryState("target", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [localAction, setLocalAction] = useState("");
  const [localTarget, setLocalTarget] = useState("");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["audit-logs", actionFilter, targetFilter, searchInput],
    queryFn: () =>
      getAuditLogsFn({
        action: actionFilter || undefined,
        targetType: targetFilter || undefined,
        actorId: searchInput || undefined,
      }),
  });

  const logs = data?.data;

  const columns: Column<AuditLogEntry>[] = [
    {
      key: "action",
      header: "Action",
      cell: (l) => <span className="text-sm text-foreground">{l?.action}</span>,
    },
    {
      key: "actorId",
      header: "Actor",
      cell: (l) => <span className="text-sm text-foreground">{l?.actorId}</span>,
    },
    {
      key: "targetType",
      header: "Target Type",
      cell: (l) => <span className="text-sm text-foreground capitalize">{l?.targetType}</span>,
    },
    {
      key: "merchantId",
      header: "Merchant",
      cell: (l) => (
        <span className="text-xs text-muted-foreground font-mono">{l?.merchantId?.slice(0, 8)}...</span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (l) => (
        <span className="text-xs text-muted-foreground">{l?.createdAt ? formatDate(l.createdAt) : "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Audit Logs" description="Track all platform activity" />
      </div>

      <div className="flex items-center gap-2">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={() => {}}
          onClear={() => setSearchInput("")}
          showClear={!!searchInput}
          placeholder="Search by actor ID..."
          className="flex-1"
        />
        <Button variant="outline" className="size-10" onClick={() => { setLocalAction(actionFilter); setLocalTarget(targetFilter); setFilterOpen(true); }}>
          <Filter className="size-4" />
        </Button>
      </div>

      <FilterModal
        open={filterOpen}
        onOpenChange={(open) => { setFilterOpen(open); if (open) { setLocalAction(actionFilter); setLocalTarget(targetFilter); } }}
        onApply={() => { setActionFilter(localAction); setTargetFilter(localTarget); setFilterOpen(false); }}
        onClear={() => { setLocalAction(""); setLocalTarget(""); setActionFilter(""); setTargetFilter(""); setFilterOpen(false); }}
      >
        <div className="space-y-4">
          <FormField label="Action">
            <Select value={localAction} onValueChange={setLocalAction}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All actions</SelectItem>
                <SelectItem value="payment.succeeded">payment.succeeded</SelectItem>
                <SelectItem value="refund.approved">refund.approved</SelectItem>
                <SelectItem value="dispute.opened">dispute.opened</SelectItem>
                <SelectItem value="settlement.approved">settlement.approved</SelectItem>
                <SelectItem value="merchant.updated">merchant.updated</SelectItem>
                <SelectItem value="account_credit.applied">account_credit.applied</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Target Type">
            <Select value={localTarget} onValueChange={setLocalTarget}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All targets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All targets</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="dispute">Dispute</SelectItem>
                <SelectItem value="settlement">Settlement</SelectItem>
                <SelectItem value="merchant">Merchant</SelectItem>
                <SelectItem value="account_credit">Account Credit</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FilterModal>

      <DataTable
        columns={columns}
        data={logs}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        emptyTitle="No audit logs found"
        emptyDescription={searchInput || actionFilter ? "Try different search terms" : "No activity recorded yet"}
      />
    </div>
  );
}

export default withSuspense(AuditLogsContent);
