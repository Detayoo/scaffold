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
import { CustomerDetailSheet } from "@/modals/CustomerDetailSheet";
import { CreateCustomerModal } from "@/modals/CreateCustomerModal";
import { getCustomerListFn } from "@/services";
import { withSuspense } from "@/components/withSuspense";
import type { GatewayCustomer } from "@/types";

function CustomersContent() {
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<GatewayCustomer | null>(null);
  const [localStatus, setLocalStatus] = useState("");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["customers", statusFilter, searchInput],
    queryFn: () => getCustomerListFn({ reference: searchInput || undefined, status: statusFilter || undefined }),
  });

  const customers = data?.data;

  const columns: Column<GatewayCustomer>[] = [
    {
      key: "reference",
      header: "Reference",
      cell: (c) => <span className="text-sm text-foreground">{c?.reference}</span>,
    },
    {
      key: "name",
      header: "Name",
      cell: (c) => <span className="text-sm text-foreground">{c?.name ?? "—"}</span>,
    },
    {
      key: "email",
      header: "Email",
      cell: (c) => <span className="text-sm text-foreground">{c?.email ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <StatusBadge status={c?.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Customers" description="View and manage your customers" />
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Create Customer
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FilterModal>

      <DataTable
        columns={columns}
        data={customers}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        emptyTitle="No customers found"
        emptyDescription={searchInput ? "Try a different search term" : "No customers yet"}
        onRowClick={(c) => setSelectedCustomer(c)}
      />

      <CreateCustomerModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={() => refetch()} />
      <CustomerDetailSheet customer={selectedCustomer} onOpenChange={(o) => { if (!o) setSelectedCustomer(null); }} />
    </div>
  );
}

export default withSuspense(CustomersContent);
