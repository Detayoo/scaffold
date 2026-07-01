"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { formatMoney } from "@/utils";
import type { ChargePolicy } from "@/types";

function MerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title={merchant?.display_name ?? "Merchant"} description="Merchant details and management" />
        <div className="flex items-center gap-2">
          <Button onClick={() => setReviewOpen(true)}>Review</Button>
        </div>
      </div>

      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load merchant details.">
        {merchant ? (
          <>
            <Card>
              <CardHeader><CardTitle>Merchant Info</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Business Name</p><p className="text-sm font-medium">{merchant?.display_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Legal Name</p><p className="text-sm">{merchant?.legal_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={merchant?.status ?? ""} size="sm" /></div>
                <div><p className="text-xs text-muted-foreground">Risk Tier</p><p className="text-sm capitalize">{merchant?.risk_tier}</p></div>
              </CardContent>
            </Card>

            {users && users.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Users</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {users.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                      <div>
                        <p className="text-sm text-foreground">{u.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{u.role}</p>
                      </div>
                      <StatusBadge status={u.status} size="sm" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {testBalance && (
                <Card>
                  <CardHeader><CardTitle>Test Balance</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{formatMoney(testBalance?.available_amount_minor)}</p>
                    <p className="text-xs text-muted-foreground">{testBalance?.currency}</p>
                  </CardContent>
                </Card>
              )}
              {liveBalance && (
                <Card>
                  <CardHeader><CardTitle>Live Balance</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold">{formatMoney(liveBalance?.available_amount_minor)}</p>
                    <p className="text-xs text-muted-foreground">{liveBalance?.currency}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {recent?.payments && recent?.payments?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  {recent?.payments?.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <p className="text-sm text-foreground">{p.reference}</p>
                      <StatusBadge status={p.status} size="sm" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {channelPolicies && channelPolicies.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Channel Policies</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {channelPolicies.map((cp: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                      <div>
                        <p className="text-sm capitalize">{cp?.channel?.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground capitalize">{cp?.environment}</p>
                      </div>
                      <StatusBadge status={cp?.enabled ? "active" : "inactive"} size="sm" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Charge Policies</p>
                <Button variant="outline" size="sm" onClick={() => setChargeOpen(true)}>
                  <Plus className="size-3.5" /> Add Charge
                </Button>
              </div>
              <DataTable columns={chargeColumns} data={charges} isPending={false} isError={false} emptyTitle="No charge policies" />
            </div>

            {auditLogs && auditLogs.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  {auditLogs.map((l: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <p className="text-sm text-foreground">{l.action}</p>
                      <p className="text-xs text-muted-foreground">{l.target_type}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </AsyncContent>

      <MerchantReviewModal open={reviewOpen} onOpenChange={setReviewOpen} merchantId={id} onSuccess={() => refetch()} />
      <ChargePolicyModal open={chargeOpen} onOpenChange={setChargeOpen} merchantId={id} onSuccess={() => refetchCharges()} />
    </div>
  );
}

export default MerchantDetailPage;
