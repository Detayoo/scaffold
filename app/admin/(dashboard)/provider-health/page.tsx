"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { Filter, Settings2 } from "lucide-react";

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
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { Input } from "@/components/ui/input";
import { getProviderHealthFn, updateProviderHealthFn } from "@/services";
import { toastMessage, extractError } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { ProviderHealthEntry } from "@/types";

function ProviderHealthContent() {
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [providerFilter, setProviderFilter] = useQueryState("provider", parseAsString.withDefault(""));
  const [channelFilter, setChannelFilter] = useQueryState("channel", parseAsString.withDefault(""));
  const [envFilter, setEnvFilter] = useQueryState("env", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [localProvider, setLocalProvider] = useState("");
  const [localChannel, setLocalChannel] = useState("");
  const [localEnv, setLocalEnv] = useState("");
  const [editEntry, setEditEntry] = useState<ProviderHealthEntry | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editReason, setEditReason] = useState("");

  const { mutateAsync: updateHealth, isPending: updating } = useMutation({
    mutationFn: updateProviderHealthFn,
    onSuccess: () => { toastMessage("success", "Provider health updated"); setEditEntry(null); refetch(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["provider-health", providerFilter, channelFilter, envFilter],
    queryFn: () =>
      getProviderHealthFn({
        provider: providerFilter || undefined,
        channel: channelFilter || undefined,
        environment: envFilter || undefined,
      }),
  });

  const entries = data?.data;

  const columns: Column<ProviderHealthEntry>[] = [
    {
      key: "provider",
      header: "Provider",
      cell: (e) => <span className="text-sm text-foreground">{e?.provider}</span>,
    },
    {
      key: "channel",
      header: "Channel",
      cell: (e) => <span className="text-sm text-foreground capitalize">{e?.channel}</span>,
    },
    {
      key: "environment",
      header: "Environment",
      cell: (e) => <span className="text-sm text-foreground capitalize">{e?.environment}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (e) => <StatusBadge status={e?.status} size="sm" />,
    },
    {
      key: "reason",
      header: "Reason",
      cell: (e) => <span className="text-sm text-muted-foreground">{e?.reason ?? "—"}</span>,
    },
    {
      key: "actions", header: "", className: "w-10",
      cell: (e) => (
        <button type="button" onClick={(ev) => { ev.stopPropagation(); setEditEntry(e); setEditStatus(e?.status ?? ""); setEditReason(e?.reason ?? ""); }} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <Settings2 className="size-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Provider Health" description="Monitor payment provider status and routing" />
      </div>

      <div className="flex items-center gap-2">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={() => {}}
          onClear={() => setSearchInput("")}
          showClear={!!searchInput}
          placeholder="Search..."
          className="flex-1"
        />
        <Button variant="outline" className="size-10" onClick={() => { setLocalProvider(providerFilter); setLocalChannel(channelFilter); setLocalEnv(envFilter); setFilterOpen(true); }}>
          <Filter className="size-4" />
        </Button>
      </div>

      <FilterModal
        open={filterOpen}
        onOpenChange={(open) => { setFilterOpen(open); if (open) { setLocalProvider(providerFilter); setLocalChannel(channelFilter); setLocalEnv(envFilter); } }}
        onApply={() => { setProviderFilter(localProvider); setChannelFilter(localChannel); setEnvFilter(localEnv); setFilterOpen(false); }}
        onClear={() => { setLocalProvider(""); setLocalChannel(""); setLocalEnv(""); setProviderFilter(""); setChannelFilter(""); setEnvFilter(""); setFilterOpen(false); }}
      >
        <div className="space-y-4">
          <FormField label="Provider">
            <Select value={localProvider} onValueChange={setLocalProvider}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All providers</SelectItem>
                <SelectItem value="INTERSWITCH">INTERSWITCH</SelectItem>
                <SelectItem value="VPS">VPS</SelectItem>
                <SelectItem value="MPGS">MPGS</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Channel">
            <Select value={localChannel} onValueChange={setLocalChannel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All channels</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Environment">
            <Select value={localEnv} onValueChange={setLocalEnv}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All environments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All environments</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FilterModal>

      <DataTable
        columns={columns}
        data={entries}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        emptyTitle="No provider health entries"
        emptyDescription={providerFilter || channelFilter || envFilter ? "Try different filters" : "No providers configured"}
      />
      <ResponsiveModal open={!!editEntry} onOpenChange={(o) => { if (!o) setEditEntry(null); }} title="Update Provider Health">
        {editEntry && (
          <div className="space-y-4 pt-2">
            <div className="text-sm">
              <p className="text-muted-foreground">{editEntry?.provider} — {editEntry?.channel} ({editEntry?.environment})</p>
            </div>
            <FormField label="Status" isRequired>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="degraded">Degraded</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Reason">
              <Input value={editReason} onChange={(e) => setEditReason(e.target.value)} placeholder="Reason for status change" />
            </FormField>
            <Button className="w-full" disabled={updating}
              onClick={async () => { try { await updateHealth({ provider: editEntry.provider, channel: editEntry.channel, environment: editEntry.environment, status: editStatus, reason: editReason || undefined, metadata: {} }); } catch {} }}>
              {updating ? "Updating..." : "Update"}
            </Button>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
}

export default withSuspense(ProviderHealthContent);
