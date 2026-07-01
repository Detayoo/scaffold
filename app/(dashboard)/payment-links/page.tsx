"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { useRouter } from "next/navigation";
import { Filter, Plus, Copy, Check, Eye } from "lucide-react";

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
import { StatusUpdateModal } from "@/modals/StatusUpdateModal";
import { CreatePaymentLinkModal } from "@/modals/CreatePaymentLinkModal";
import { getPaylinksFn } from "@/services";
import { formatMoney } from "@/utils";
import { withSuspense } from "@/components/withSuspense";

const statusLabels: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};
const statusOptions = Object.keys(statusLabels);

function PaylinksContent() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("");
  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);

  const handleSearch = useCallback(() => {}, []);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
  }, []);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["paylinks", statusFilter, searchInput],
    queryFn: () => getPaylinksFn({ reference: searchInput || undefined, status: statusFilter || undefined }),
  });

  const paylinks = data?.data;

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Name",
      className: "w-60",
      cell: (pl) => <span className="text-sm text-foreground truncate block">{pl?.name || "—"}</span>,
    },
    {
      key: "reference",
      header: "Reference",
      cell: (pl) => <span className="text-sm text-foreground truncate block max-w-32">{pl?.reference}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (pl) => <span className="text-sm text-foreground">{pl?.amountMinor ? formatMoney(pl?.amountMinor) : "—"}</span>,
    },
    {
      key: "paymentLink",
      header: "Payment Link",
      cell: (pl) => (
        <div className="flex items-center gap-1">
          <span className="text-sm text-foreground truncate flex-1 max-w-64">{pl?.paymentLink || pl?.payment_link || "—"}</span>
          {pl?.paymentLink && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(pl.paymentLink); setCopiedUrlId(pl.id); setTimeout(() => setCopiedUrlId(null), 2000); }}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {copiedUrlId === pl.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </button>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (pl) => <StatusBadge status={pl?.status} size="sm" />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-px",
      cell: (pl) => (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => router.push(`/payment-links/${pl?.id}`)}
            className="inline-flex items-center justify-center rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <Eye className="size-3.5 mr-1" />
            View
          </button>
          <Button variant="outline" size="sm" onClick={() => setStatusUpdateId(pl?.id)}>
            Update Status
          </Button>
        </div>
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
                <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
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
      />

      <CreatePaymentLinkModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={() => refetch()} />

      <StatusUpdateModal
        open={!!statusUpdateId}
        onOpenChange={(o) => { if (!o) setStatusUpdateId(null); }}
        paylinkId={statusUpdateId ?? ""}
        currentStatus={paylinks?.find((p: any) => p.id === statusUpdateId)?.status ?? ""}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

export default withSuspense(PaylinksContent);
