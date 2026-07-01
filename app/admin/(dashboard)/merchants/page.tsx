"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { getAdminMerchantsFn } from "@/services";
import { withSuspense } from "@/components/withSuspense";
import type { AdminMerchant } from "@/types";

function AdminMerchantsContent() {
  const router = useRouter();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
  const [size, setSize] = useQueryState("size", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [riskFilter, setRiskFilter] = useQueryState("risk", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("");
  const [localRisk, setLocalRisk] = useState("");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-merchants", page, size, search, statusFilter, riskFilter],
    queryFn: () =>
      getAdminMerchantsFn({
        search: search || undefined,
        status: statusFilter || undefined,
        riskTier: riskFilter || undefined,
        limit: size,
        offset: page * size,
      }),
  });

  const merchants = data?.data?.merchants;
  const totalRecords = data?.data?.pagination?.total;
  const pageCount = totalRecords ? Math.ceil(totalRecords / size) : 0;

  const columns: Column<AdminMerchant>[] = [
    { key: "display_name", header: "Name", cell: (m) => <span className="text-sm text-foreground">{m?.display_name}</span> },
    { key: "email", header: "Email", cell: (m) => <span className="text-sm text-foreground">{m?.email}</span> },
    { key: "status", header: "Status", cell: (m) => <StatusBadge status={m?.status} size="sm" /> },
    { key: "risk_tier", header: "Risk Tier", cell: (m) => <span className="text-sm capitalize">{m?.risk_tier}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Merchants" description="Manage platform merchants" />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search merchants..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-8" />
        </div>
        <Button variant="outline" className="size-10" onClick={() => { setLocalStatus(statusFilter); setLocalRisk(riskFilter); setFilterOpen(true); }}>
          <Filter className="size-4" />
        </Button>
      </div>

      <FilterModal
        open={filterOpen}
        onOpenChange={(open) => { setFilterOpen(open); if (open) { setLocalStatus(statusFilter); setLocalRisk(riskFilter); } }}
        onApply={() => { setStatusFilter(localStatus); setRiskFilter(localRisk); setPage(0); setFilterOpen(false); }}
        onClear={() => { setLocalStatus(""); setLocalRisk(""); setStatusFilter(""); setRiskFilter(""); setPage(0); setFilterOpen(false); }}
      >
        <div className="space-y-4">
          <FormField label="Status">
            <Select value={localStatus} onValueChange={setLocalStatus}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Risk Tier">
            <Select value={localRisk} onValueChange={setLocalRisk}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All tiers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All tiers</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FilterModal>

      <DataTable
        columns={columns}
        data={merchants}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        pageCount={pageCount}
        currentPage={page}
        perPage={size}
        totalRecords={totalRecords}
        itemOffset={page * size}
        onPageChange={(selected) => setPage(selected)}
        onPerPageChange={(newSize) => { setSize(newSize); setPage(0); }}
        emptyTitle="No merchants found"
        emptyDescription={search ? "Try a different search term" : "No merchants registered"}
        onRowClick={(m) => router.push(`/admin/merchants/${m?.id}`)}
      />
    </div>
  );
}

export default withSuspense(AdminMerchantsContent);
