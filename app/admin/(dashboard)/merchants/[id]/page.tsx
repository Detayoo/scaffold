"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { use } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { AsyncContent } from "@/components/AsyncContent";
import { MerchantReviewModal } from "@/modals/MerchantReviewModal";
import { ChargePolicyModal } from "@/modals/ChargePolicyModal";
import { getAdminMerchantDetailFn, getAdminMerchantChargesFn } from "@/services";
import { formatMoney, formatDate } from "@/utils";
import type { ChargePolicy } from "@/types";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "channels", label: "Channel Policies" },
  { id: "payments", label: "Recent Payments" },
  { id: "charges", label: "Charges" },
  { id: "audit", label: "Audit Logs" },
];

function MerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useQueryState("tab", { defaultValue: "overview" });
  const [reviewOpen, setReviewOpen] = useState(false);
  const [chargeOpen, setChargeOpen] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin-merchant-detail", id],
    queryFn: () => getAdminMerchantDetailFn({ id }),
    enabled: !!id,
  });

  const { data: chargesData, refetch: refetchCharges } = useQuery({
    queryKey: ["admin-merchant-charges", id],
    queryFn: () => getAdminMerchantChargesFn({ id }),
    enabled: !!id,
  });

  const merchant = data?.data?.merchant;
  const users = data?.data?.users;
  const channelPolicies = data?.data?.channel_policies;
  const balances = data?.data?.balances;
  const recent = data?.data?.recent;
  const auditLogs = data?.data?.audit_logs;
  const charges = chargesData?.data;
  const testBalance = balances?.test?.[0];
  const liveBalance = balances?.live?.[0];

  const chargeColumns: Column<ChargePolicy>[] = [
    { key: "channel", header: "Channel", cell: (c) => <span className="text-sm capitalize">{c?.channel?.replace(/_/g, " ")}</span> },
    { key: "environment", header: "Env", cell: (c) => <span className="text-sm capitalize">{c?.environment}</span> },
    { key: "percentage_bps", header: "% (bps)", cell: (c) => <span className="text-sm">{c?.percentage_bps}</span> },
    { key: "fixed_amount_minor", header: "Fixed", cell: (c) => <span className="text-sm">{formatMoney(c?.fixed_amount_minor)}</span> },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c?.status} size="sm" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={merchant?.display_name ?? "Merchant"} description="Merchant details and management" />

      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load merchant details.">
        {merchant ? (
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            {/* Sidebar tabs */}
            <nav className="flex shrink-0 flex-col gap-1 lg:w-48">
              {tabs.map((t) => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-left ${tab === t.id ? "bg-foreground/5 font-medium text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}>
                  {t.label}
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">

              {tab === "overview" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={merchant?.status ?? ""} size="sm" /></div>
                      <div><p className="text-xs text-muted-foreground">Risk Tier</p><p className="text-sm font-medium capitalize">{merchant?.risk_tier}</p></div>
                      {testBalance && <div><p className="text-xs text-muted-foreground">Test Balance</p><p className="text-sm font-semibold">{formatMoney(testBalance?.available_amount_minor)}</p></div>}
                      {liveBalance && <div><p className="text-xs text-muted-foreground">Live Balance</p><p className="text-sm font-semibold">{formatMoney(liveBalance?.available_amount_minor)}</p></div>}
                    </div>
                    <Button variant="outline" onClick={() => setReviewOpen(true)}>Review</Button>
                  </div>
                </div>
              )}

              {tab === "users" && (
                <div className="space-y-2">
                  {users && users.length > 0 ? users.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                      <div>
                        <p className="text-sm text-foreground">{u.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                      </div>
                      <StatusBadge status={u.status} size="sm" />
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No users.</p>}
                </div>
              )}

              {tab === "channels" && (
                <div className="space-y-2">
                  {channelPolicies && channelPolicies.length > 0 ? channelPolicies.map((cp: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                      <div>
                        <p className="text-sm capitalize">{cp?.channel?.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground capitalize">{cp?.environment}</p>
                      </div>
                      <StatusBadge status={cp?.enabled ? "active" : "inactive"} size="sm" />
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No channel policies.</p>}
                </div>
              )}

              {tab === "payments" && (
                <div className="space-y-1">
                  {recent?.payments && recent?.payments?.length > 0 ? recent?.payments?.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <p className="text-sm text-foreground">{p.reference}</p>
                      <StatusBadge status={p.status} size="sm" />
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No recent payments.</p>}
                </div>
              )}

              {tab === "charges" && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setChargeOpen(true)}>
                      <Plus className="size-3.5" /> Add Charge
                    </Button>
                  </div>
                  <DataTable columns={chargeColumns} data={charges} isPending={false} isError={false} emptyTitle="No charge policies" emptyDescription="Add a charge policy to get started." emptyAction={{ label: "Add Charge", onClick: () => setChargeOpen(true) }} />
                </div>
              )}

              {tab === "audit" && (
                <div className="space-y-1">
                  {auditLogs && auditLogs.length > 0 ? auditLogs.map((l: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <p className="text-sm text-foreground">{l.action}</p>
                      <p className="text-xs text-muted-foreground">{l.target_type}</p>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No audit logs.</p>}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </AsyncContent>

      <MerchantReviewModal open={reviewOpen} onOpenChange={setReviewOpen} merchantId={id} onSuccess={() => refetch()} />
      <ChargePolicyModal open={chargeOpen} onOpenChange={setChargeOpen} merchantId={id} onSuccess={() => refetchCharges()} />
    </div>
  );
}

export default MerchantDetailPage;
