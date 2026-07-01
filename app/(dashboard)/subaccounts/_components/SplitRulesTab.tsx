"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateSplitRuleModal } from "@/modals/CreateSplitRuleModal";

const columns: Column<any>[] = [
  { key: "name", header: "Name", cell: (r) => <span className="text-sm text-foreground">{r?.name}</span> },
  { key: "ruleType", header: "Type", cell: (r) => <span className="text-sm capitalize text-foreground">{r?.ruleType}</span> },
  { key: "basis", header: "Basis", cell: (r) => <span className="text-sm capitalize text-foreground">{r?.basis}</span> },
  { key: "status", header: "Status", cell: (r) => <StatusBadge status={r?.status} size="sm" /> },
  { key: "version", header: "Version", cell: (r) => <span className="text-sm text-foreground">v{r?.version ?? 1}</span> },
];

export function SplitRulesTab() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Create Split Rule
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={undefined}
        isPending={false}
        isError={false}
        emptyTitle="No split rules yet"
        emptyDescription="Create a split rule to define how payments are distributed."
        emptyAction={{ label: "Create Split Rule", onClick: () => setCreateOpen(true) }}
      />

      <CreateSplitRuleModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}
