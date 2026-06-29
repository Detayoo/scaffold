"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, ArrowLeftRight, Undo2, Landmark, RefreshCw, BookOpen } from "lucide-react";

import { getExportsFn, getReadModelsFn, getRunbooksFn } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { ExportModal } from "@/components/ExportModal";
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

  const { data: exportsData, isPending: exportsPending, isError: exportsError, refetch: refetchExports } = useQuery({
    queryKey: ["exports"],
    queryFn: () => getExportsFn({}),
  });

  const { data: modelsData } = useQuery({
    queryKey: ["read-models"],
    queryFn: getReadModelsFn,
  });

  const { data: runbooksData } = useQuery({
    queryKey: ["runbooks"],
    queryFn: getRunbooksFn,
  });

  const exports = exportsData?.data ?? [];
  const models = modelsData?.data ?? [];
  const runbooks = runbooksData?.data ?? [];

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
        <AsyncContent isPending={exportsPending} isError={exportsError} onRetry={refetchExports} errorMessage="Failed to load exports">
          {exports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exports yet. Start by exporting data above.</p>
          ) : (
            <div className="space-y-2">
              {exports.map((job) => (
                <Card key={job?.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">{job?.exportType}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(job?.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={job?.status} size="sm" />
                      {job?.status === "completed" && job?.storageRef && (
                        <Button variant="outline" size="sm" onClick={() => window.open(job.storageRef, "_blank")}>
                          <Download className="size-3.5" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </AsyncContent>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">
          <RefreshCw className="size-4 inline mr-2 text-muted-foreground" />
          Read Models
        </h2>
        <Card>
          <CardContent className="p-0">
            {models.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">No read models available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Model</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Rows</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Lag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((m: any, idx: number) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="px-4 py-3 text-sm text-foreground">{m?.modelName}</td>
                        <td className="px-4 py-3"><StatusBadge status={m?.status} size="sm" /></td>
                        <td className="px-4 py-3 text-sm text-foreground">{m?.rowCount ?? "—"}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{m?.lagSeconds ?? 0}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">
          <BookOpen className="size-4 inline mr-2 text-muted-foreground" />
          Runbooks
        </h2>
        <div className="space-y-3">
          {runbooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runbooks available.</p>
          ) : (
            runbooks.map((rb: any, idx: number) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <p className="text-sm font-medium">{rb?.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rb?.slug}</p>
                  {rb?.triggers && rb.triggers.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground font-medium">Triggers:</p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground mt-0.5">
                        {rb.triggers.map((t: string, i: number) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

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
