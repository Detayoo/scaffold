"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { Filter, Send, Lock, Undo2 } from "lucide-react";

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
import {
  getAccountCreditsFn,
  applyAccountCreditFn,
  holdAccountCreditFn,
  refundAccountCreditFn,
} from "@/services";
import { formatMoney, toastMessage, extractError } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { AccountCreditEntry } from "@/types";

function DedicatedAccountsContent() {
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("");
  const [selectedCredit, setSelectedCredit] = useState<AccountCreditEntry | null>(null);
  const [creditAction, setCreditAction] = useState<string | null>(null);
  const [creditRef, setCreditRef] = useState("");
  const [holdReason, setHoldReason] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundBank, setRefundBank] = useState("");
  const [refundAccount, setRefundAccount] = useState("");

  const { data, isPending, refetch } = useQuery({
    queryKey: ["account-credits", statusFilter],
    queryFn: () => getAccountCreditsFn({ status: statusFilter || undefined }),
  });

  const credits = data?.data;

  const { mutateAsync: applyCredit, isPending: applying } = useMutation({
    mutationFn: applyAccountCreditFn,
    onSuccess: () => { toastMessage("success", "Credit applied"); setCreditAction(null); setSelectedCredit(null); refetch(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: holdCredit, isPending: holding } = useMutation({
    mutationFn: holdAccountCreditFn,
    onSuccess: () => { toastMessage("success", "Credit held"); setCreditAction(null); setSelectedCredit(null); refetch(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: refundCredit, isPending: refunding } = useMutation({
    mutationFn: refundAccountCreditFn,
    onSuccess: () => { toastMessage("success", "Credit refunded"); setCreditAction(null); setSelectedCredit(null); refetch(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const columns: Column<AccountCreditEntry>[] = [
    { key: "amountMinor", header: "Amount", cell: (c) => <span className="text-sm text-foreground">{formatMoney(c?.amountMinor)}</span> },
    { key: "currency", header: "Currency", cell: (c) => <span className="text-sm text-foreground">{c?.currency}</span> },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c?.status} size="sm" /> },
    { key: "createdAt", header: "Date", cell: (c) => <span className="text-xs text-muted-foreground">{c?.createdAt ?? "—"}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Account Credits" description="Manage unapplied and held account credits" />

      <div className="flex items-center gap-2">
        <SearchInput value={searchInput} onChange={setSearchInput} onSearch={() => {}} onClear={() => setSearchInput("")} showClear={!!searchInput} placeholder="Search..." className="flex-1" />
        <Button variant="outline" className="size-10" onClick={() => { setLocalStatus(statusFilter); setFilterOpen(true); }}>
          <Filter className="size-4" />
        </Button>
      </div>

      <FilterModal open={filterOpen} onOpenChange={setFilterOpen}
        onApply={() => { setStatusFilter(localStatus); setFilterOpen(false); }}
        onClear={() => { setLocalStatus(""); setStatusFilter(""); setFilterOpen(false); }}>
        <FormField label="Status">
          <Select value={localStatus} onValueChange={setLocalStatus}>
            <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">All statuses</SelectItem>
              <SelectItem value="unapplied">Unapplied</SelectItem>
              <SelectItem value="held">Held</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FilterModal>

      <DataTable columns={columns} data={credits} isPending={isPending} isError={false}
        emptyTitle="No credits" emptyDescription="No account credits found"
        onRowClick={(c) => setSelectedCredit(c)}
      />

      {selectedCredit && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Credit: {formatMoney(selectedCredit?.amountMinor)}</p>
            <button type="button" onClick={() => { setSelectedCredit(null); setCreditAction(null); }} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Close</button>
          </div>
          <p className="text-xs text-muted-foreground">Status: <StatusBadge status={selectedCredit?.status} size="sm" /></p>
          {(selectedCredit?.status === "unapplied" || selectedCredit?.status === "held") && !creditAction && (
            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="gap-2" onClick={() => { setCreditAction("apply"); setCreditRef(""); }}>
                <Send className="size-3.5" /> Apply
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => { setCreditAction("hold"); setHoldReason(""); }}>
                <Lock className="size-3.5" /> Hold
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => { setCreditAction("refund"); setRefundReason(""); setRefundBank(""); setRefundAccount(""); }}>
                <Undo2 className="size-3.5" /> Refund
              </Button>
            </div>
          )}
          {creditAction === "apply" && (
            <div className="space-y-2 pt-2 border-t">
              <FormField label="Payment Reference" isRequired>
                <Input value={creditRef} onChange={(e) => setCreditRef(e.target.value)} placeholder="ord_lagos_..." />
              </FormField>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCreditAction(null)}>Cancel</Button>
                <Button onClick={async () => { try { await applyCredit({ id: selectedCredit.id, reference: creditRef }); } catch {} }} disabled={applying || !creditRef}>
                  {applying ? "Applying..." : "Apply"}
                </Button>
              </div>
            </div>
          )}
          {creditAction === "hold" && (
            <div className="space-y-2 pt-2 border-t">
              <FormField label="Reason" isRequired>
                <Input value={holdReason} onChange={(e) => setHoldReason(e.target.value)} placeholder="Suspected duplicate" />
              </FormField>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCreditAction(null)}>Cancel</Button>
                <Button onClick={async () => { try { await holdCredit({ id: selectedCredit.id, reason: holdReason }); } catch {} }} disabled={holding || !holdReason}>
                  {holding ? "Holding..." : "Hold"}
                </Button>
              </div>
            </div>
          )}
          {creditAction === "refund" && (
            <div className="space-y-2 pt-2 border-t">
              <FormField label="Reason" isRequired>
                <Input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Customer transferred to inactive account" />
              </FormField>
              <FormField label="Refund Bank">
                <Input value={refundBank} onChange={(e) => setRefundBank(e.target.value)} placeholder="Access Bank" />
              </FormField>
              <FormField label="Refund Account">
                <Input value={refundAccount} onChange={(e) => setRefundAccount(e.target.value)} placeholder="0123456789" />
              </FormField>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCreditAction(null)}>Cancel</Button>
                <Button onClick={async () => { try { await refundCredit({ id: selectedCredit.id, reason: refundReason, evidence: { refund_bank: refundBank, refund_account: refundAccount } }); } catch {} }} disabled={refunding || !refundReason}>
                  {refunding ? "Refunding..." : "Refund"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default withSuspense(DedicatedAccountsContent);
