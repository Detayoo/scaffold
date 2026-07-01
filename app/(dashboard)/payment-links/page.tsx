"use client";

import { useCallback, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { useRouter } from "next/navigation";
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
import { CreatePaymentLinkModal } from "@/modals/CreatePaymentLinkModal";
import { getPaylinksFn, updatePaylinkStatusFn } from "@/services";
import { toastMessage, extractError, formatMoney } from "@/utils";
import { withSuspense } from "@/components/withSuspense";

const statusOptions = ["draft", "active", "paused", "archived"];

function PaylinksContent() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("");

  const handleSearch = useCallback(() => {}, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
  }, []);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["paylinks", statusFilter, searchInput],
    queryFn: () => getPaylinksFn({ reference: searchInput || undefined, status: statusFilter || undefined }),
  });

  const paylinks = data?.data;

  const { mutateAsync: updateStatus } = useMutation({
    mutationFn: updatePaylinkStatusFn,
    onSuccess: () => {
      toastMessage("success", "Status updated");
      refetch();
    },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status });
    } catch {}
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Name",
      cell: (pl) => <span className="text-sm text-foreground">{pl?.name || "—"}</span>,
    },
    {
      key: "reference",
      header: "Reference",
      cell: (pl) => <span className="text-sm text-foreground">{pl?.reference}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (pl) => <span className="text-sm text-foreground">{pl?.amountMinor ? formatMoney(pl?.amountMinor) : "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (pl) => <StatusBadge status={pl?.status} size="sm" />,
    },
    {
      key: "actions",
      header: "",
      className: "pr-6",
      cell: (pl) => (
        <Select
          value={pl?.status}
          onValueChange={(v) => handleStatusChange(pl?.id, v)}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <div className="space-y-4">
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
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={handleSearch}
          onClear={handleClearSearch}
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
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
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
        emptyDescription="Create one to start collecting payments."
        emptyAction={{ label: "Create Link", onClick: () => setCreateOpen(true) }}
        onRowClick={(pl) => router.push(`/payment-links/${pl?.id}`)}
      />

      <CreatePaymentLinkModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={() => refetch()} />
    </div>
  );
}

export default withSuspense(PaylinksContent);
