"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/FormField";
import { DatePicker } from "@/components/DatePicker";
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { SettlementDetailSheet } from "@/modals/SettlementDetailSheet";
import { runSettlementFn, runSplitSettlementFn } from "@/services";
import { formatMoney, toastMessage, extractError } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { SettlementBatch } from "@/types";

const MOCK_BATCHES: SettlementBatch[] = [
  { id: "a2eb6401-160a-4031-b6e3-9a1df9e09d50", merchantId: "87fb27f1-9221-46e6-a5e1-c03d2e6840b1", currency: "NGN", channel: "bank_transfer", provider: "VPS", status: "generated", netAmountMinor: 1225000, itemCount: 1 },
  { id: "b3f5c2e1-260b-5142-c7f4-0b2ef0f10e61", merchantId: "87fb27f1-9221-46e6-a5e1-c03d2e6840b1", currency: "NGN", channel: "bank_transfer", provider: "VPS", status: "approved", netAmountMinor: 3450000, itemCount: 3, approvedAt: "2026-06-30T12:00:00.000Z" },
  { id: "c4d6f3e2-370c-6253-d8a5-1c3fg1f20f72", merchantId: "a2b3c4d5-6789-0123-4567-89abcdef012345", currency: "NGN", channel: "card", provider: "MPGS", status: "paid", netAmountMinor: 875000, itemCount: 2, approvedAt: "2026-06-29T10:00:00.000Z" },
];

const MOCK_MERCHANTS = [
  { id: "87fb27f1-9221-46e6-a5e1-c03d2e6840b1", name: "Alausa Mart" },
  { id: "a2b3c4d5-6789-0123-4567-89abcdef012345", name: "Balogun Rice Store" },
  { id: "e5f6a7b8-9012-3456-789a-bcdef012345678", name: "Ikeja Tech Hub" },
];

function AdminSettlementsContent() {
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatch | null>(null);
  const [splitModal, setSplitModal] = useState(false);
  const [settlementModal, setSettlementModal] = useState(false);
  const [splitMerchantId, setSplitMerchantId] = useState("");
  const [splitEnv, setSplitEnv] = useState("test");
  const [settleMerchantId, setSettleMerchantId] = useState("");
  const [settleEnv, setSettleEnv] = useState("test");
  const [settleChannel, setSettleChannel] = useState("bank_transfer");
  const [settleAsOf, setSettleAsOf] = useState("");

  const { mutateAsync: runBatch, isPending: isRunning } = useMutation({
    mutationFn: runSettlementFn,
    onSuccess: () => toastMessage("success", "Settlement run completed"),
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: runSplit, isPending: isSplitting } = useMutation({
    mutationFn: runSplitSettlementFn,
    onSuccess: () => { toastMessage("success", "Split settlement generated"); setSplitModal(false); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const columns: Column<SettlementBatch>[] = [
    { key: "id", header: "ID", cell: (b) => <span className="text-xs text-muted-foreground font-mono">{b?.id?.slice(0, 8)}...</span> },
    { key: "currency", header: "Currency", cell: (b) => <span className="text-sm text-foreground">{b?.currency}</span> },
    { key: "netAmountMinor", header: "Net Amount", cell: (b) => <span className="text-sm text-foreground">{formatMoney(b?.netAmountMinor)}</span> },
    { key: "status", header: "Status", cell: (b) => <StatusBadge status={b?.status} size="sm" /> },
    { key: "itemCount", header: "Items", cell: (b) => <span className="text-sm text-foreground">{b?.itemCount}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Settlements" description="Generate and manage merchant settlement batches" />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSplitModal(true)}>
            <Play className="size-4" />
            Run Split Settlement
          </Button>
          <Button onClick={() => setSettlementModal(true)}>
            <Play className="size-4" />
            Run Settlement
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={MOCK_BATCHES}
        isPending={false}
        isError={false}
        emptyTitle="No settlement batches"
        emptyDescription="Run a settlement to generate batches"
        onRowClick={(b) => setSelectedBatch(b)}
      />

      <SettlementDetailSheet batch={selectedBatch} onOpenChange={(o) => { if (!o) setSelectedBatch(null); }} />

      <ResponsiveModal open={settlementModal} onOpenChange={setSettlementModal} title="Run Settlement">
        <div className="space-y-4 pt-2">
          <FormField label="Merchant" isRequired>
            <Select value={settleMerchantId} onValueChange={setSettleMerchantId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select merchant" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_MERCHANTS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Environment" isRequired>
            <Select value={settleEnv} onValueChange={setSettleEnv}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Channel" isRequired>
            <Select value={settleChannel} onValueChange={setSettleChannel}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <DatePicker label="As Of" value={settleAsOf ? new Date(settleAsOf) : undefined} onChange={(d) => setSettleAsOf(d ? d.toISOString() : "")} />
          <Button className="w-full" disabled={isRunning || !settleMerchantId}
            onClick={async () => { try { await runBatch({ merchantId: settleMerchantId, environment: settleEnv, currency: "NGN", channel: settleChannel, asOf: settleAsOf || undefined }); } catch {} }}>
            {isRunning ? "Running..." : "Run Settlement"}
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveModal open={splitModal} onOpenChange={setSplitModal} title="Run Split Settlement">
        <div className="space-y-4 pt-2">
          <FormField label="Merchant" isRequired>
            <Select value={splitMerchantId} onValueChange={setSplitMerchantId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select merchant" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_MERCHANTS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Environment" isRequired>
            <Select value={splitEnv} onValueChange={setSplitEnv}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <Button className="w-full" disabled={isSplitting || !splitMerchantId}
            onClick={async () => { try { await runSplit({ merchantId: splitMerchantId, environment: splitEnv }); } catch {} }}>
            {isSplitting ? "Running..." : "Run Split Settlement"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
}

export default withSuspense(AdminSettlementsContent);
