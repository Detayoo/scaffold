"use client";

import { useQueryState, parseAsString } from "nuqs";

import { PageHeader } from "@/components/PageHeader";
import { SubaccountsTab } from "./_components/SubaccountsTab";
import { SplitRulesTab } from "./_components/SplitRulesTab";
import { withSuspense } from "@/components/withSuspense";

const tabs = [
  { id: "subaccounts", label: "Subaccounts" },
  { id: "split-rules", label: "Split Rules" },
];

function SubaccountsContent() {
  const [tab, setTab] = useQueryState("tab", { defaultValue: "subaccounts" });

  return (
    <div className="space-y-6">
      <PageHeader title="Subaccounts" description="Manage split settlement recipients and split rules" />

      <div className="flex gap-1 border-b">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 pb-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "subaccounts" && <SubaccountsTab />}
      {tab === "split-rules" && <SplitRulesTab />}
    </div>
  );
}

export default withSuspense(SubaccountsContent);
