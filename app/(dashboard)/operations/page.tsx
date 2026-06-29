"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, ArrowLeftRight, Undo2, Landmark } from "lucide-react";

import { getExportsFn } from "@/services";
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

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["exports"],
    queryFn: () => getExportsFn({}),
  });

  const exports = data?.data ?? [];

  const openExport = (type: string) => {
    setExportType(type);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Operations" description="Export your data and manage operational tasks" />

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
        <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load exports">
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

      <ExportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        exportType={exportType}
        label={exportTypes.find((e) => e.key === exportType)?.label ?? ""}
        onComplete={() => refetch()}
      />
    </div>
  );
}
