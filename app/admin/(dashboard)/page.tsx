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
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { withSuspense } from "@/components/withSuspense";
import { getAdminMerchantsFn } from "@/services";
import type { AuditLogEntry, AdminMerchant } from "@/types";

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
  const { data: merchantsData } = useQuery({
    queryKey: ["admin-home-merchants"],
    queryFn: () => getAdminMerchantsFn({ limit: 10 }),
  });

  const merchants = merchantsData?.data?.merchants;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin-home-logs"],
    queryFn: () => getAuditLogsFn(),
  });

  const logs = data?.data?.slice(0, 5);

  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const logColumns: Column<AuditLogEntry>[] = [
    {
      key: "createdAt", header: "Date",
      cell: (l) => <span className="text-xs text-foreground">{l?.createdAt ? formatDate(l.createdAt) : "—"}</span>,
    },
    { key: "actionName", header: "Action", cell: (l) => <span className="text-sm text-foreground">{l?.actionName ?? l?.action}</span> },
    { key: "actorLabel", header: "Actor", cell: (l) => <span className="text-sm text-foreground">{l?.actorLabel ?? l?.actorId}</span> },
    { key: "targetType", header: "Target", cell: (l) => <span className="text-sm text-foreground capitalize">{l?.targetType}</span> },
  ];

  const merchantColumns: Column<AdminMerchant>[] = [
    { key: "display_name", header: "Name", cell: (m) => <span className="text-sm text-foreground">{m?.display_name}</span> },
    { key: "email", header: "Email", cell: (m) => <span className="text-sm text-foreground">{m?.email}</span> },
    { key: "status", header: "Status", cell: (m) => <StatusBadge status={m?.status} size="sm" /> },
    { key: "risk_tier", header: "Risk", cell: (m) => <span className="text-sm capitalize">{m?.risk_tier}</span> },
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
          <div className="flex items-center justify-between">
            <CardTitle>Merchants</CardTitle>
            <Link href="/admin/merchants" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View All</Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={merchantColumns} data={merchants} isPending={false} isError={false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/admin/audit-logs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View All</Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load activity">
            {logs && logs.length > 0 ? (
              <DataTable columns={logColumns} data={logs} isPending={false} isError={false} onRowClick={(l) => setSelectedLog(l)} />
            ) : (
              <p className="text-sm text-muted-foreground p-4">No recent activity.</p>
            )}
          </AsyncContent>
        </CardContent>
      </Card>

      <ResponsiveSheet open={!!selectedLog} onOpenChange={(o) => { if (!o) setSelectedLog(null); }} title="Activity Details">
        {selectedLog && (
          <div className="space-y-4 pt-2">
            <div><p className="text-xs text-muted-foreground">Activity</p><p className="text-sm">{selectedLog?.activity ?? selectedLog?.action ?? "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Action</p><p className="text-sm">{selectedLog?.actionName ?? selectedLog?.action}</p></div>
            <div><p className="text-xs text-muted-foreground">Actor</p><p className="text-sm">{selectedLog?.actorLabel ?? selectedLog?.actorId}</p></div>
            <div><p className="text-xs text-muted-foreground">Target</p><p className="text-sm capitalize">{selectedLog?.targetLabel ?? selectedLog?.targetType}</p></div>
            <div><p className="text-xs text-muted-foreground">Date</p><p className="text-sm">{selectedLog?.createdAt ? formatDate(selectedLog.createdAt) : "—"}</p></div>
          </div>
        )}
      </ResponsiveSheet>
    </div>
  );
}

export default withSuspense(AdminHome);
