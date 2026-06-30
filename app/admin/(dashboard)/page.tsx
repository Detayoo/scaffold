"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Users, Undo2, Scale, FileText, Activity, Landmark, FileSearch } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable, type Column } from "@/components/DataTable";
import { AsyncContent } from "@/components/AsyncContent";
import { getAuditLogsFn } from "@/services";
import { formatDate } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { AuditLogEntry } from "@/types";

const MOCK_MERCHANTS = [
  { id: "87fb27f1-...", display_name: "Alausa Mart", legal_name: "Alausa Mart", email: "ops@alausamart.ng", status: "ACTIVE", risk_tier: "standard", default_currency: "NGN", settlement_bank_account_id: null, created_at: "", updated_at: "" },
  { id: "a2b3c4d5-...", display_name: "Balogun Rice Store", legal_name: "Balogun Rice Store", email: "hello@balogunrice.ng", status: "ACTIVE", risk_tier: "standard", default_currency: "NGN", settlement_bank_account_id: null, created_at: "", updated_at: "" },
  { id: "e5f6a7b8-...", display_name: "Ikeja Tech Hub", legal_name: "Ikeja Tech Hub", email: "biz@ikejatech.ng", status: "PENDING", risk_tier: "standard", default_currency: "NGN", settlement_bank_account_id: null, created_at: "", updated_at: "" },
  { id: "c9d0e1f2-...", display_name: "Lekki Fresh Foods", legal_name: "Lekki Fresh Foods", email: "info@lekkifresh.ng", status: "SUSPENDED", risk_tier: "standard", default_currency: "NGN", settlement_bank_account_id: null, created_at: "", updated_at: "" },
  { id: "f0a1b2c3-...", display_name: "Kano Textiles Ltd", legal_name: "Kano Textiles Ltd", email: "sales@kanotextiles.ng", status: "ACTIVE", risk_tier: "standard", default_currency: "NGN", settlement_bank_account_id: null, created_at: "", updated_at: "" },
];

const quickActions = [
  { label: "Merchants", href: "/admin/merchants", icon: Users },
  { label: "Settlements", href: "/admin/settlements", icon: Landmark },
  { label: "Reconciliation", href: "/admin/reconciliation", icon: FileSearch },
  { label: "Refunds", href: "/admin/refunds", icon: Undo2 },
  { label: "Disputes", href: "/admin/disputes", icon: Scale },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  { label: "Provider Health", href: "/admin/provider-health", icon: Activity },
];

function AdminHome() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin-home-logs"],
    queryFn: () => getAuditLogsFn(),
  });

  const logs = data?.data?.slice(0, 5);

  const logColumns: Column<AuditLogEntry>[] = [
    { key: "action", header: "Action", cell: (l) => <span className="text-sm text-foreground">{l?.action}</span> },
    { key: "actorId", header: "Actor", cell: (l) => <span className="text-sm text-foreground">{l?.actorId}</span> },
    {
      key: "createdAt", header: "Date",
      cell: (l) => <span className="text-xs text-muted-foreground">{l?.createdAt ? formatDate(l.createdAt) : "—"}</span>,
    },
  ];

  const merchantColumns: Column<any>[] = [
    { key: "display_name", header: "Name", cell: (m) => <span className="text-sm text-foreground">{m?.display_name}</span> },
    { key: "email", header: "Email", cell: (m) => <span className="text-sm text-foreground">{m?.email}</span> },
    { key: "status", header: "Status", cell: (m) => <StatusBadge status={m?.status} size="sm" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Platform overview and management" />

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button variant="outline" className="gap-2">
                  <action.icon className="size-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Merchants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={merchantColumns} data={MOCK_MERCHANTS} isPending={false} isError={false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load activity">
            {logs && logs.length > 0 ? (
              <DataTable columns={logColumns} data={logs} isPending={false} isError={false} />
            ) : (
              <p className="text-sm text-muted-foreground p-4">No recent activity.</p>
            )}
          </AsyncContent>
        </CardContent>
      </Card>
    </div>
  );
}

export default withSuspense(AdminHome);
