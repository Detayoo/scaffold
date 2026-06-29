"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryState, parseAsString } from "nuqs";
import { Filter, Ban, Trash2, Send, Lock, Undo2 } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  getAccountCreditsFn,
  applyAccountCreditFn,
  holdAccountCreditFn,
  refundAccountCreditFn,
} from "@/services";
import { formatMoney, toastMessage, extractError } from "@/utils";
import { withSuspense } from "@/components/withSuspense";
import type { AccountCreditEntry } from "@/types";

const MOCK_DVAS = [
  { id: "c21bd2f1-5207-4132-a512-2e8265dfc446", customerId: "2f1a27cb-...", provider: "VPS", accountNumber: "7701234567", accountName: "CHINEDU OKAFOR", bankName: "VPS Dedicated Bank", currency: "NGN", status: "active" },
  { id: "d32e3f2a-6308-5243-b623-3f9372fc557b", customerId: "a2b3c4d5-...", provider: "VPS", accountNumber: "7701234568", accountName: "BALOGUN RICE", bankName: "VPS Dedicated Bank", currency: "NGN", status: "active" },
  { id: "e43f4a3b-7409-6354-c734-4a0483fd668c", customerId: null, provider: "VPS", accountNumber: "7701234569", accountName: "ALAUBA MART", bankName: "VPS Dedicated Bank", currency: "NGN", status: "suspended" },
];

function DedicatedAccountsContent() {
  const [tab, setTab] = useState<"dvas" | "credits">("dvas");
  const [searchInput, setSearchInput] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string } | null>(null);
  const [selectedCredit, setSelectedCredit] = useState<AccountCreditEntry | null>(null);
  const [creditAction, setCreditAction] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [holdReason, setHoldReason] = useState("");
  const [refundAccount, setRefundAccount] = useState("");
  const [refundBankCode, setRefundBankCode] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const { data: creditsData, isPending: creditsPending, refetch: refetchCredits } = useQuery({
    queryKey: ["account-credits", statusFilter],
    queryFn: () => getAccountCreditsFn({ status: statusFilter || undefined }),
  });

  const credits = creditsData?.data;

  const { mutateAsync: suspendDva, isPending: suspending } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await import("@/services").then((m) => m.v1AdminAuthenticatedApi().post(`/admin/dedicated-accounts/${id}/suspend`));
    },
    onSuccess: () => { toastMessage("success", "DVA suspended"); setConfirmAction(null); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: deactivateDva, isPending: deactivating } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await import("@/services").then((m) => m.v1AdminAuthenticatedApi().post(`/admin/dedicated-accounts/${id}/deactivate`));
    },
    onSuccess: () => { toastMessage("success", "DVA deactivated"); setConfirmAction(null); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: applyCredit, isPending: applying } = useMutation({
    mutationFn: applyAccountCreditFn,
    onSuccess: () => { toastMessage("success", "Credit applied"); setCreditAction(null); setSelectedCredit(null); refetchCredits(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: holdCredit, isPending: holding } = useMutation({
    mutationFn: holdAccountCreditFn,
    onSuccess: () => { toastMessage("success", "Credit held"); setCreditAction(null); setSelectedCredit(null); refetchCredits(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const { mutateAsync: refundCredit, isPending: refunding } = useMutation({
    mutationFn: refundAccountCreditFn,
    onSuccess: () => { toastMessage("success", "Credit refunded"); setCreditAction(null); setSelectedCredit(null); refetchCredits(); },
    onError: (err) => toastMessage("error", extractError(err)),
  });

  const dvasColumns: Column<any>[] = [
    { key: "accountNumber", header: "Account", cell: (d) => <span className="text-sm text-foreground">{d?.accountNumber}</span> },
    { key: "accountName", header: "Name", cell: (d) => <span className="text-sm text-foreground">{d?.accountName}</span> },
    { key: "bankName", header: "Bank", cell: (d) => <span className="text-sm text-foreground">{d?.bankName}</span> },
    { key: "provider", header: "Provider", cell: (d) => <span className="text-sm text-foreground">{d?.provider}</span> },
    { key: "status", header: "Status", cell: (d) => <StatusBadge status={d?.status} size="sm" /> },
    {
      key: "actions", header: "", className: "w-20",
      cell: (d) => (
        <div className="flex gap-3">
          {d?.status === "active" && (
            <button type="button" onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: "suspend", id: d.id }); }} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer" title="Suspend">
              <Ban className="size-3.5" />
            </button>
          )}
          {d?.status !== "deactivated" && (
            <button type="button" onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: "deactivate", id: d.id }); }} className="text-xs text-muted-foreground hover:text-destructive cursor-pointer" title="Deactivate">
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const creditsColumns: Column<AccountCreditEntry>[] = [
    { key: "amountMinor", header: "Amount", cell: (c) => <span className="text-sm text-foreground">{formatMoney(c?.amountMinor)}</span> },
    { key: "currency", header: "Currency", cell: (c) => <span className="text-sm text-foreground">{c?.currency}</span> },
    { key: "status", header: "Status", cell: (c) => <StatusBadge status={c?.status} size="sm" /> },
    { key: "createdAt", header: "Date", cell: (c) => <span className="text-xs text-muted-foreground">{c?.createdAt ?? "—"}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dedicated Accounts" description="Manage virtual accounts and unapplied credits" />

      <div className="flex gap-1 border-b">
        {[{ id: "dvas", label: "Virtual Accounts" }, { id: "credits", label: "Unapplied Credits" }].map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id as "dvas" | "credits")}
            className={`px-4 pb-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dvas" && (
        <div className="space-y-4">
          <DataTable columns={dvasColumns} data={MOCK_DVAS} isPending={false} isError={false}
            emptyTitle="No virtual accounts"
            emptyDescription="No dedicated accounts found" />
        </div>
      )}

      {tab === "credits" && (
        <div className="space-y-4">
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

          <DataTable columns={creditsColumns} data={credits} isPending={creditsPending} isError={false}
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
                <div className="flex flex-wrap gap-6 pt-6">
                  <Button size="sm" className="gap-2" onClick={() => { setCreditAction("apply"); setPaymentIntentId(""); }}>
                    <Send className="size-3.5" /> Apply
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => { setCreditAction("hold"); setHoldReason(""); }}>
                    <Lock className="size-3.5" /> Hold
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => { setCreditAction("refund"); setRefundAccount(""); setRefundBankCode(""); setRefundReason(""); }}>
                    <Undo2 className="size-3.5" /> Refund
                  </Button>
                </div>
              )}
              {creditAction === "apply" && (
                <div className="space-y-2 pt-2 border-t">
                  <FormField label="Payment Intent ID" isRequired>
                    <Input value={paymentIntentId} onChange={(e) => setPaymentIntentId(e.target.value)} placeholder="uuid" />
                  </FormField>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCreditAction(null)}>Cancel</Button>
                    <Button size="sm" onClick={async () => { try { await applyCredit({ id: selectedCredit.id, paymentIntentId }); } catch {} }} disabled={applying || !paymentIntentId}>
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
                    <Button variant="outline" size="sm" onClick={() => setCreditAction(null)}>Cancel</Button>
                    <Button size="sm" onClick={async () => { try { await holdCredit({ id: selectedCredit.id, reason: holdReason }); } catch {} }} disabled={holding || !holdReason}>
                      {holding ? "Holding..." : "Hold"}
                    </Button>
                  </div>
                </div>
              )}
              {creditAction === "refund" && (
                <div className="space-y-2 pt-2 border-t">
                  <FormField label="Destination Account" isRequired>
                    <Input value={refundAccount} onChange={(e) => setRefundAccount(e.target.value)} placeholder="0123456789" />
                  </FormField>
                  <FormField label="Bank Code" isRequired>
                    <Input value={refundBankCode} onChange={(e) => setRefundBankCode(e.target.value)} placeholder="058" />
                  </FormField>
                  <FormField label="Reason" isRequired>
                    <Input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Customer requested return" />
                  </FormField>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCreditAction(null)}>Cancel</Button>
                    <Button size="sm" onClick={async () => { try { await refundCredit({ id: selectedCredit.id, destinationAccountNumber: refundAccount, destinationBankCode: refundBankCode, reason: refundReason }); } catch {} }} disabled={refunding || !refundAccount || !refundBankCode || !refundReason}>
                      {refunding ? "Refunding..." : "Refund"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog open={confirmAction?.type === "suspend"} onOpenChange={(o) => { if (!o) setConfirmAction(null); }}
        title="Suspend DVA" description="Suspend this dedicated virtual account?"
        confirmLabel="Suspend" variant="default"
        onConfirm={async () => { try { if (confirmAction) await suspendDva({ id: confirmAction.id }); } catch {} }}
        loading={suspending} />

      <ConfirmDialog open={confirmAction?.type === "deactivate"} onOpenChange={(o) => { if (!o) setConfirmAction(null); }}
        title="Deactivate DVA" description="Permanently deactivate this dedicated virtual account?"
        confirmLabel="Deactivate" variant="destructive"
        onConfirm={async () => { try { if (confirmAction) await deactivateDva({ id: confirmAction.id }); } catch {} }}
        loading={deactivating} />
    </div>
  );
}

export default withSuspense(DedicatedAccountsContent);
