"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { Filter, Play, Upload, Plus } from "lucide-react";

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
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { FilterModal } from "@/components/FilterModal";
import { SectionHeader } from "@/components/SectionHeader";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Separator } from "@/components/ui/separator";
import {
  runReconciliationFn,
  importProviderStatementsFn,
  getReconciliationExceptionsFn,
  assignReconciliationExceptionFn,
  resolveReconciliationExceptionFn,
  createManualAdjustmentFn,
} from "@/services";
import { DatePicker } from "@/components/DatePicker";
import { toastMessage, extractError, formatMoney } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { ReconciliationException } from "@/types";

function ReconciliationContent() {
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [typeFilter, setTypeFilter] = useQueryState("type", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [localType, setLocalType] = useState("");
  const [localStatus, setLocalStatus] = useState("");
  const [reconModal, setReconModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedExc, setSelectedExc] = useState<ReconciliationException | null>(null);
  const [action, setAction] = useState<string | null>(null);

  // Reconcile form
  const [reconImportId, setReconImportId] = useState("");
  const [reconJobType, setReconJobType] = useState("provider_payment_reconciliation");
  const [reconProvider, setReconProvider] = useState("VPS");

  // Import form
  const [importProvider, setImportProvider] = useState("VPS");
  const [importItems, setImportItems] = useState("");
  const [importStatementBank, setImportStatementBank] = useState("");

  // Adjust form
  const [adjMerchantId, setAdjMerchantId] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [adjLines, setAdjLines] = useState([{ ownerType: "merchant", ownerId: "", accountType: "merchant_available_balance", accountName: "Merchant Available Balance", direction: "debit", amountMinor: 0, currency: "NGN" }]);

  // Assign form
  const [ownerId, setOwnerId] = useState("");
  const [ownerName, setOwnerName] = useState("");

  // Resolve form
  const [resolveReason, setResolveReason] = useState("");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["reconciliation-exceptions", typeFilter, statusFilter, searchInput],
    queryFn: () =>
      getReconciliationExceptionsFn({
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        ownerId: searchInput || undefined,
      }),
  });

  const exceptions = data?.data;

  const { mutateAsync: runRecon, isPending: isReconning } = useMutation({
    mutationFn: runReconciliationFn,
    onSuccess: (res) => { toastMessage("success", `Reconciliation complete: ${res?.data?.matched} matched, ${res?.data?.exceptions} exceptions`); setReconModal(false); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: importStatements, isPending: isImporting } = useMutation({
    mutationFn: importProviderStatementsFn,
    onSuccess: (res) => { toastMessage("success", `Imported ${res?.data?.imported} items`); setImportModal(false); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: createAdjustment, isPending: isAdjusting } = useMutation({
    mutationFn: createManualAdjustmentFn,
    onSuccess: () => { toastMessage("success", "Adjustment created"); setAdjustModal(false); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: assignExc, isPending: isAssigning } = useMutation({
    mutationFn: assignReconciliationExceptionFn,
    onSuccess: () => { toastMessage("success", "Exception assigned"); setAction(null); setSelectedExc(null); refetch(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: resolveExc, isPending: isResolving } = useMutation({
    mutationFn: resolveReconciliationExceptionFn,
    onSuccess: () => { toastMessage("success", "Exception resolved"); setAction(null); setSelectedExc(null); refetch(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const columns: Column<ReconciliationException>[] = [
    { key: "type", header: "Type", cell: (e) => <span className="text-sm text-foreground capitalize">{e?.type?.replace(/_/g, " ")}</span> },
    { key: "status", header: "Status", cell: (e) => <StatusBadge status={e?.status} size="sm" /> },
    { key: "provider", header: "Provider", cell: (e) => <span className="text-sm text-foreground">{e?.provider}</span> },
    { key: "expectedAmountMinor", header: "Expected", cell: (e) => <span className="text-sm text-foreground">{formatMoney(e?.expectedAmountMinor ?? 0)}</span> },
    { key: "receivedAmountMinor", header: "Received", cell: (e) => <span className="text-sm text-foreground">{formatMoney(e?.receivedAmountMinor ?? 0)}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reconciliation" description="Run reconciliation, manage exceptions, and create adjustments" />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="gap-2" onClick={() => setReconModal(true)}>
          <Play className="size-4" /> Run Reconciliation
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setImportModal(true)}>
          <Upload className="size-4" /> Import Statements
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setAdjustModal(true)}>
          <Plus className="size-4" /> Manual Adjustment
        </Button>
      </div>

      <SectionHeader title="Exceptions" description="Reconciliation exceptions requiring attention" />

      <div className="flex items-center gap-2">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          onSearch={() => {}}
          onClear={() => setSearchInput("")}
          showClear={!!searchInput}
          placeholder="Search by owner ID..."
          className="flex-1"
        />
        <Button variant="outline" className="size-10" onClick={() => { setLocalType(typeFilter); setLocalStatus(statusFilter); setFilterOpen(true); }}>
          <Filter className="size-4" />
        </Button>
      </div>

      <FilterModal
        open={filterOpen}
        onOpenChange={(open) => { setFilterOpen(open); if (open) { setLocalType(typeFilter); setLocalStatus(statusFilter); } }}
        onApply={() => { setTypeFilter(localType); setStatusFilter(localStatus); setFilterOpen(false); }}
        onClear={() => { setLocalType(""); setLocalStatus(""); setTypeFilter(""); setStatusFilter(""); setFilterOpen(false); }}
      >
        <div className="space-y-4">
          <FormField label="Type">
            <Select value={localType} onValueChange={setLocalType}>
              <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All types</SelectItem>
                <SelectItem value="amount_mismatch">Amount Mismatch</SelectItem>
                <SelectItem value="missing_provider">Missing Provider Record</SelectItem>
                <SelectItem value="missing_ledger">Missing Ledger Entry</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={localStatus} onValueChange={setLocalStatus}>
              <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FilterModal>

      <DataTable
        columns={columns}
        data={exceptions}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        emptyTitle="No exceptions"
        emptyDescription="No reconciliation exceptions found"
        onRowClick={(e) => setSelectedExc(e)}
      />

      {selectedExc && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Exception Details</p>
            <button type="button" onClick={() => { setSelectedExc(null); setAction(null); }} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Close</button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Type</p><p className="capitalize">{selectedExc?.type?.replace(/_/g, " ")}</p></div>
            <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={selectedExc?.status} size="sm" /></div>
            <div><p className="text-xs text-muted-foreground">Expected</p><p>{formatMoney(selectedExc?.expectedAmountMinor ?? 0)}</p></div>
            <div><p className="text-xs text-muted-foreground">Received</p><p>{formatMoney(selectedExc?.receivedAmountMinor ?? 0)}</p></div>
            <div className="col-span-2"><p className="text-xs text-muted-foreground">Provider Ref</p><p className="font-mono text-xs">{selectedExc?.providerReference ?? "—"}</p></div>
            {selectedExc?.ownerName && <div className="col-span-2"><p className="text-xs text-muted-foreground">Owner</p><p>{selectedExc.ownerName}</p></div>}
          </div>
          {selectedExc?.status === "open" && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => { setAction("assign"); setOwnerId(""); setOwnerName(""); }}>Assign</Button>
            </div>
          )}
          {selectedExc?.status === "assigned" && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={() => { setAction("resolve"); setResolveReason(""); }}>Resolve</Button>
            </div>
          )}
          {action === "assign" && (
            <div className="space-y-2 pt-2 border-t">
              <FormField label="Owner ID" isRequired>
                <Input value={ownerId} onChange={(e) => setOwnerId(e.target.value)} placeholder="ops_user_01" />
              </FormField>
              <FormField label="Owner Name" isRequired>
                <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Finance Ops" />
              </FormField>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setAction(null)}>Cancel</Button>
                <Button size="sm" onClick={async () => { try { await assignExc({ id: selectedExc.id, ownerId, ownerName }); } catch {} }} disabled={isAssigning || !ownerId || !ownerName}>
                  {isAssigning ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </div>
          )}
          {action === "resolve" && (
            <div className="space-y-2 pt-2 border-t">
              <FormField label="Resolution Reason" isRequired>
                <Input value={resolveReason} onChange={(e) => setResolveReason(e.target.value)} placeholder="Provider confirmed correct amount" />
              </FormField>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setAction(null)}>Cancel</Button>
                <Button size="sm" onClick={async () => { try { await resolveExc({ id: selectedExc.id, reason: resolveReason, evidence: {} }); } catch {} }} disabled={isResolving || !resolveReason}>
                  {isResolving ? "Resolving..." : "Resolve"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ResponsiveModal open={reconModal} onOpenChange={setReconModal} title="Run Reconciliation">
        <div className="space-y-4 pt-2">
          <FormField label="Import ID" isRequired>
            <Input value={reconImportId} onChange={(e) => setReconImportId(e.target.value)} placeholder="uuid" />
          </FormField>
          <FormField label="Job Type" isRequired>
            <Select value={reconJobType} onValueChange={setReconJobType}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="provider_payment_reconciliation">Provider Payment Reconciliation</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Provider" isRequired>
            <Select value={reconProvider} onValueChange={setReconProvider}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VPS">VPS</SelectItem>
                <SelectItem value="INTERSWITCH">INTERSWITCH</SelectItem>
                <SelectItem value="MPGS">MPGS</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <Button className="w-full" disabled={isReconning || !reconImportId}
            onClick={async () => { try { await runRecon({ importId: reconImportId, jobType: reconJobType, environment: "test", provider: reconProvider, detectMissingProvider: true, metadata: { operator: "Admin" } }); } catch {} }}>
            {isReconning ? "Running..." : "Run Reconciliation"}
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveModal open={importModal} onOpenChange={setImportModal} title="Import Provider Statements">
        <div className="space-y-4 pt-2">
          <FormField label="Provider" isRequired>
            <Select value={importProvider} onValueChange={setImportProvider}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VPS">VPS</SelectItem>
                <SelectItem value="INTERSWITCH">INTERSWITCH</SelectItem>
                <SelectItem value="MPGS">MPGS</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Statement Bank">
            <Input value={importStatementBank} onChange={(e) => setImportStatementBank(e.target.value)} placeholder="Providus Bank" />
          </FormField>
          <FormField label="Items (JSON)" isRequired>
            <Input value={importItems} onChange={(e) => setImportItems(e.target.value)} placeholder='[{"providerReference":"...","amountMinor":1000,"currency":"NGN","occurredAt":"2026-..."}]' />
          </FormField>
          <Button className="w-full" disabled={isImporting || !importItems}
            onClick={async () => { try { await importStatements({ sourceType: "provider_statement", provider: importProvider, environment: "test", items: JSON.parse(importItems), metadata: importStatementBank ? { statement_bank: importStatementBank, statement_date: new Date().toISOString().split("T")[0] } : undefined }); } catch (e) { toastMessage("error", "Invalid JSON"); } }}>
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveModal open={adjustModal} onOpenChange={setAdjustModal} title="Manual Adjustment">
        <div className="space-y-4 pt-2">
          <FormField label="Merchant ID" isRequired>
            <Input value={adjMerchantId} onChange={(e) => setAdjMerchantId(e.target.value)} placeholder="uuid" />
          </FormField>
          <FormField label="Reason" isRequired>
            <Input value={adjReason} onChange={(e) => setAdjReason(e.target.value)} placeholder="Correct duplicate import" />
          </FormField>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Ledger Lines</p>
            <div className="space-y-3">
              {adjLines.map((line, i) => (
                <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Line {i + 1}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="Owner Type">
                      <Select value={line.ownerType} onValueChange={(v) => { const l = [...adjLines]; l[i] = { ...l[i], ownerType: v }; setAdjLines(l); }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="merchant">Merchant</SelectItem>
                          <SelectItem value="platform">Platform</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Account Type">
                      <Input value={line.accountType} onChange={(e) => { const l = [...adjLines]; l[i] = { ...l[i], accountType: e.target.value }; setAdjLines(l); }} placeholder="merchant_available_balance" />
                    </FormField>
                  </div>
                  <FormField label="Account Name">
                    <Input value={line.accountName} onChange={(e) => { const l = [...adjLines]; l[i] = { ...l[i], accountName: e.target.value }; setAdjLines(l); }} placeholder="Merchant Available Balance" />
                  </FormField>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="Direction">
                      <Select value={line.direction} onValueChange={(v) => { const l = [...adjLines]; l[i] = { ...l[i], direction: v }; setAdjLines(l); }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debit">Debit</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Amount (kobo)">
                      <Input type="number" value={line.amountMinor || ""} onChange={(e) => { const l = [...adjLines]; l[i] = { ...l[i], amountMinor: Number(e.target.value) }; setAdjLines(l); }} placeholder="50000" />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" className="mt-2 w-full gap-2" onClick={() => setAdjLines([...adjLines, { ownerType: "platform", ownerId: "", accountType: "suspense", accountName: "Suspense / Exceptions", direction: "credit", amountMinor: 0, currency: "NGN" }])}>
              + Add Line
            </Button>
          </div>
          <Button className="w-full" disabled={isAdjusting || !adjMerchantId || !adjReason || adjLines.length === 0}
            onClick={async () => { try { await createAdjustment({ merchantId: adjMerchantId, reason: adjReason, lines: adjLines }); } catch {} }}>
            {isAdjusting ? "Creating..." : "Create Adjustment"}
          </Button>
        </div>
      </ResponsiveModal>
    </div>
  );
}

export default withSuspense(ReconciliationContent);
