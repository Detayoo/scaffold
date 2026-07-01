"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, ArrowLeftRight, Undo2, Landmark, RefreshCw, BookOpen, Eye } from "lucide-react";

import { getExportsFn, getExportDownloadFn, getReadModelsFn, getRunbooksFn } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { ExportModal } from "@/components/ExportModal";
import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { DataTable, type Column } from "@/components/DataTable";
import { formatDate } from "@/utils";

const exportTypes = [
  { key: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { key: "settlements", label: "Settlements", icon: Landmark },
  { key: "refunds", label: "Refunds", icon: Undo2 },
  { key: "disputes", label: "Disputes", icon: FileText },
];

export default function OperationsPage() {
  const [exportType, setExportType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRunbook, setSelectedRunbook] = useState<any | null>(null);

  const handleDownload = useCallback(async (id: string) => {
    try {
      const res = await getExportDownloadFn({ id });
      const ref = res?.data?.storageRef;
      if (ref) window.open(ref, "_blank");
    } catch {}
  }, []);

  const exportColumns: Column<any>[] = [
    { key: "createdAt", header: "Created", cell: (j) => <span className="text-xs text-foreground">{j?.createdAt ? formatDate(j.createdAt) : "—"}</span> },
    { key: "exportType", header: "Type", cell: (j) => <span className="text-sm capitalize text-foreground">{j?.exportType}</span> },
    { key: "environment", header: "Environment", cell: (j) => <span className="text-sm capitalize text-foreground">{j?.environment ?? "—"}</span> },
    { key: "rowCount", header: "Rows", cell: (j) => <span className="text-sm text-foreground">{j?.rowCount ?? "—"}</span> },
    { key: "status", header: "Status", cell: (j) => <StatusBadge status={j?.status} size="sm" /> },
    {
      key: "actions",
      header: "",
      className: "pr-6",
      cell: (j) => j?.status === "completed" ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleDownload(j?.id); }}
          className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-medium cursor-pointer"
        >
          <Download className="size-3.5 mr-1.5" />
          Download
        </button>
      ) : null,
    },
  ];

  const { data: exportsData, isPending: exportsPending, isError: exportsError, refetch: refetchExports } = useQuery({
    queryKey: ["exports"],
    queryFn: () => getExportsFn({}),
  });

  const { data: modelsData, isPending: modelsPending, isError: modelsError, refetch: refetchModels } = useQuery({
    queryKey: ["read-models"],
    queryFn: getReadModelsFn,
  });

  const { data: runbooksData, isPending: runbooksPending, isError: runbooksError, refetch: refetchRunbooks } = useQuery({
    queryKey: ["runbooks"],
    queryFn: getRunbooksFn,
  });

  const exports = exportsData?.data ?? [];
  const models = (modelsData?.data ?? []) as any[];
  const runbooks = (runbooksData?.data ?? []) as any[];

  const openExport = (type: string) => {
    setExportType(type);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Operations" description="Export data, monitor read models, and view runbooks" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {exportTypes.map((et) => (
          <Card key={et.key} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openExport(et.key)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <et.icon className="size-4 text-muted-foreground" />
                {et.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2">
                <Download className="size-4" />
                Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">Export History</h2>
        <DataTable
          columns={exportColumns}
          data={exports}
          isPending={exportsPending}
          isError={exportsError}
          onRetry={refetchExports}
          errorMessage="Failed to load exports"
          emptyTitle="No exports yet"
          emptyDescription="Start by exporting data above."
        />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">
          <RefreshCw className="size-4 inline mr-2 text-muted-foreground" />
          Read Models
        </h2>
        <DataTable
          columns={[
            { key: "modelName", header: "Model", cell: (m: any) => <span className="text-sm text-foreground">{m?.modelName}</span> },
            { key: "status", header: "Status", cell: (m: any) => <StatusBadge status={m?.status} size="sm" /> },
            { key: "rowCount", header: "Rows", cell: (m: any) => <span className="text-sm text-foreground">{m?.rowCount ?? "—"}</span> },
            { key: "lagSeconds", header: "Lag", cell: (m: any) => <span className="text-sm text-foreground">{m?.lagSeconds ?? 0}s</span> },
          ]}
          data={models}
          isPending={modelsPending}
          isError={modelsError}
          onRetry={refetchModels}
          errorMessage="Failed to load read models"
          emptyTitle="No read models"
        />
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">
          <BookOpen className="size-4 inline mr-2 text-muted-foreground" />
          Runbooks
        </h2>
        <DataTable
          columns={[
            { key: "title", header: "Title", cell: (rb: any) => <span className="text-sm font-medium text-foreground">{rb?.title}</span> },
            { key: "triggers", header: "Triggers", cell: (rb: any) => <span className="text-sm text-muted-foreground">{rb?.triggers?.length ?? 0} trigger{(rb?.triggers?.length ?? 0) !== 1 ? "s" : ""}</span> },
            { key: "slug", header: "Slug", cell: (rb: any) => <span className="text-sm text-muted-foreground">{rb?.slug}</span> },
            { key: "actions", header: "", className: "pr-6", cell: () => <Eye className="size-4 text-muted-foreground" /> },
          ]}
          data={runbooks}
          isPending={runbooksPending}
          isError={runbooksError}
          onRetry={refetchRunbooks}
          errorMessage="Failed to load runbooks"
          emptyTitle="No runbooks"
          onRowClick={(rb) => setSelectedRunbook(rb)}
        />
      </div>

      <ResponsiveSheet
        open={!!selectedRunbook}
        onOpenChange={(o) => { if (!o) setSelectedRunbook(null); }}
        title={selectedRunbook?.title ?? "Runbook Details"}
      >
        {selectedRunbook && (
          <div className="space-y-5 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Title</p>
              <p className="text-sm font-medium text-foreground">{selectedRunbook?.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Slug</p>
              <p className="text-sm text-muted-foreground">{selectedRunbook?.slug}</p>
            </div>
            {selectedRunbook?.triggers && selectedRunbook.triggers.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1.5">Triggers</p>
                <ul className="space-y-1.5">
                  {selectedRunbook.triggers.map((t: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 size-1.5 rounded-full bg-warning shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedRunbook?.actions && selectedRunbook.actions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1.5">Actions</p>
                <ul className="space-y-1.5">
                  {selectedRunbook.actions.map((a: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </ResponsiveSheet>

      <ExportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        exportType={exportType}
        label={exportTypes.find((e) => e.key === exportType)?.label ?? ""}
        onComplete={() => refetchExports()}
      />
    </div>
  );
}
