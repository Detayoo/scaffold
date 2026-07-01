"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { getSubaccountsFn } from "@/services";
import { CreateSubaccountModal } from "@/modals/CreateSubaccountModal";
import type { Subaccount } from "@/types";

export function SubaccountsTab() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["subaccounts"],
    queryFn: () => getSubaccountsFn(),
  });

  const subaccounts = data?.data;

  const columns: Column<Subaccount>[] = [
    {
      key: "name",
      header: "Name",
      cell: (s) => <span className="text-sm text-foreground">{s?.name}</span>,
    },
    {
      key: "settlementBankAccountId",
      header: "Bank Account",
      cell: (s) => (
        <div className="flex flex-col">
          <span className="text-sm text-foreground">{s?.metadata?.bank_name ?? "—"} · {s?.metadata?.account_number ?? "—"}</span>
          <span className="text-xs text-muted-foreground">{s?.metadata?.account_name ?? ""}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (s) => <StatusBadge status={s?.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Create Subaccount
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={subaccounts}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        emptyTitle="No subaccounts yet"
        emptyDescription="Create your first subaccount to start splitting payments."
        emptyAction={{ label: "Create Subaccount", onClick: () => setCreateOpen(true) }}
      />

      <CreateSubaccountModal open={createOpen} onOpenChange={setCreateOpen} onSuccess={() => refetch()} />
    </div>
  );
}
