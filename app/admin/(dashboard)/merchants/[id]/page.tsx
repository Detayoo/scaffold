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
  { id: "balances", label: "Balances" },
  { id: "charges", label: "Charges" },
  { id: "users", label: "Users" },
  { id: "channels", label: "Channel Policies" },
  { id: "payments", label: "Recent Payments" },
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
                    </div>
                    <Button variant="outline" onClick={() => setReviewOpen(true)}>Review</Button>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4 grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground">Business Name</p><p className="text-sm font-medium">{merchant?.display_name}</p></div>
                    <div><p className="text-xs text-muted-foreground">Legal Name</p><p className="text-sm">{merchant?.legal_name}</p></div>
                    <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{merchant?.email}</p></div>
                    <div><p className="text-xs text-muted-foreground">Default Currency</p><p className="text-sm">{merchant?.default_currency}</p></div>
                    <div><p className="text-xs text-muted-foreground">Settlement Bank</p><p className="text-sm">{merchant?.settlement_bank_account_id ?? "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm">{merchant?.created_at ? formatDate(merchant.created_at) : "—"}</p></div>
                  </div>
                </div>
              )}

              {tab === "balances" && (
                <div className="space-y-6">
                  {["test", "live"].map((env) => {
                    const b = balances?.[env]?.[0];
                    if (!b) return null;
                    return (
                      <div key={env}>
                        <p className="text-sm font-medium text-foreground capitalize mb-3">{env} Environment</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                          {[
                            { label: "Pending", value: b?.pending_amount_minor },
                            { label: "Available", value: b?.available_amount_minor },
                            { label: "Held", value: b?.held_amount_minor },
                            { label: "Settlement Payable", value: b?.settlement_payable_amount_minor },
                            { label: "Paid", value: b?.paid_amount_minor },
                          ].map((item) => (
                            <div key={item.label} className="rounded-lg border bg-muted/30 p-3">
                              <p className="text-xs text-muted-foreground">{item.label}</p>
                              <p className="text-lg font-semibold mt-1">{formatMoney(item.value ?? 0)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {tab === "users" && (
                <DataTable
                  columns={[
                    { key: "email", header: "Email", cell: (u: any) => <span className="text-sm text-foreground">{u.email}</span> },
                    { key: "role", header: "Role", cell: (u: any) => <span className="text-sm capitalize">{u.role}</span> },
                    { key: "status", header: "Status", cell: (u: any) => <StatusBadge status={u.status} size="sm" /> },
                  ]}
                  data={users}
                  isPending={false}
                  isError={false}
                  emptyTitle="No users"
                />
              )}

              {tab === "channels" && (
                <DataTable
                  columns={[
                    { key: "channel", header: "Channel", cell: (cp: any) => <span className="text-sm capitalize">{cp?.channel?.replace(/_/g, " ")}</span> },
                    { key: "environment", header: "Environment", cell: (cp: any) => <span className="text-sm capitalize">{cp?.environment}</span> },
                    { key: "enabled", header: "Status", cell: (cp: any) => <StatusBadge status={cp?.enabled ? "active" : "inactive"} size="sm" /> },
                  ]}
                  data={channelPolicies}
                  isPending={false}
                  isError={false}
                  emptyTitle="No channel policies"
                />
              )}

              {tab === "payments" && (
                <div className="space-y-4">
                  <DataTable
                    columns={[
                      { key: "reference", header: "Reference", cell: (p: any) => <span className="text-sm text-foreground">{p?.reference}</span> },
                      { key: "amount_minor", header: "Amount", cell: (p: any) => <span className="text-sm text-foreground">{formatMoney(p?.amount_minor)}</span> },
                      { key: "status", header: "Status", cell: (p: any) => <StatusBadge status={p?.status} size="sm" /> },
                      { key: "settlement_status", header: "Settlement", cell: (p: any) => <span className="text-sm capitalize">{p?.settlement_status}</span> },
                      { key: "created_at", header: "Date", cell: (p: any) => <span className="text-xs text-foreground">{p?.created_at ? formatDate(p.created_at) : "—"}</span> },
                    ]}
                    data={recent?.payments}
                    isPending={false}
                    isError={false}
                    emptyTitle="No recent payments"
                  />
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
                <DataTable
                  columns={[
                    { key: "action", header: "Action", cell: (l: any) => <span className="text-sm text-foreground">{l.action}</span> },
                    { key: "actor_type", header: "Actor", cell: (l: any) => <span className="text-sm capitalize">{l?.actor_type?.replace(/_/g, " ")}</span> },
                    { key: "target_type", header: "Target", cell: (l: any) => <span className="text-sm capitalize">{l?.target_type?.replace(/_/g, " ")}</span> },
                    { key: "created_at", header: "Date", cell: (l: any) => <span className="text-xs text-foreground">{l?.created_at ? formatDate(l.created_at) : "—"}</span> },
                  ]}
                  data={auditLogs}
                  isPending={false}
                  isError={false}
                  emptyTitle="No audit logs"
                />
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
