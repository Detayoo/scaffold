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
import { getProviderHealthFn } from "@/services";
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
    </div>
  );
}

export default withSuspense(ProviderHealthContent);
