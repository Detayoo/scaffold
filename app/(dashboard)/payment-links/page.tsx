"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Plus, Search, Copy, Check, Filter, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { referenceColumn, amountColumn, statusColumn, dateColumn, actionsColumn } from "@/components/ColumnHelpers";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FormField } from "@/components/FormField";
import {
  getPaymentLinksFn,
  createPaymentLinkFn,
  managePaymentLinkFn,
} from "@/services/queries/payment-links";
import { createPaymentLinkSchema } from "@/utils/validators";
import { toastMessage, extractError, formatDate, formatMoney } from "@/utils";
import type { PaymentLink } from "@/types";
import { withSuspense } from "@/components/withSuspense";
import type { z } from "zod";
type CreateFormData = z.infer<typeof createPaymentLinkSchema>;

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

function PaymentLinksContent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
  const [size, setSize] = useQueryState("size", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [isActiveFilter, setIsActiveFilter] = useQueryState("isActive", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createdLink, setCreatedLink] = useState<{ url: string; reference: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"ACTIVATE" | "DEACTIVATE">("DEACTIVATE");

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["payment-links", page, size, search, statusFilter, isActiveFilter],
    queryFn: () =>
      getPaymentLinksFn({
        page: page + 1,
        size,
        reference: search || undefined,
        status: statusFilter || undefined,
        isActive: isActiveFilter === "" ? undefined : isActiveFilter === "true",
      }),
  });

  const form = useForm<CreateFormData>({
    resolver: zodResolver(createPaymentLinkSchema),
    defaultValues: {
      amount: "",
      currency: "NGN",
      reason: "",
      isReusable: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: createPaymentLinkFn,
    onSuccess: (res) => {
      setCreatedLink({
        url: res.data.paylink.url,
        reference: res.data.paylink.reference,
      });
      toastMessage("success", "Payment link created successfully");
      queryClient.invalidateQueries({ queryKey: ["payment-links"] });
    },
    onError: (err) => {
      toastMessage("error", extractError(err));
    },
  });

  const manageMutation = useMutation({
    mutationFn: managePaymentLinkFn,
    onSuccess: (res) => {
      toastMessage("success", res.message);
      queryClient.invalidateQueries({ queryKey: ["payment-links"] });
      setConfirmId(null);
    },
    onError: (err) => {
      toastMessage("error", extractError(err));
    },
  });

  const handleCreate = async (values: CreateFormData) => {
    await createMutation.mutateAsync({
      amount: Number(values.amount),
      currency: values.currency,
      reason: values.reason || undefined,
      isReusable: values.isReusable,
    });
  };

  const handleManage = (id: string, state: "ACTIVATE" | "DEACTIVATE") => {
    setConfirmId(id);
    setConfirmAction(state);
  };

  const confirmManage = async () => {
    if (!confirmId) return;
    await manageMutation.mutateAsync({ id: confirmId, state: confirmAction });
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastMessage("error", "Failed to copy");
    }
  };

  const resetCreateModal = () => {
    setCreateOpen(false);
    form.reset();
    setCreatedLink(null);
    setCopied(false);
  };

  const paylinks = data?.data?.paylinks;
  const pagination = data?.data;

  const columns = [
    referenceColumn((item: PaymentLink) => item.reference),
    amountColumn((item: PaymentLink) => item.amount, (item: PaymentLink) => item.currency),
    statusColumn((item: PaymentLink) => item.status),
    {
      key: "reason",
      header: "Reason",
      cell: (item: PaymentLink) => (
        <span className="text-muted-foreground">{item.reason || "—"}</span>
      ),
    },
    dateColumn((item: PaymentLink) => item.createdAt),
    actionsColumn((item: PaymentLink) => (
      <Button
        variant={item.isActive ? "outline" : "default"}
        onClick={(e) => {
          e.stopPropagation();
          handleManage(item.id, item.isActive ? "DEACTIVATE" : "ACTIVATE");
        }}
      >
        {item.isActive ? "Deactivate" : "Activate"}
      </Button>
    )),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="Payment Links" description="Create and manage shareable payment links" />
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Create Link
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-8"
          />
        </div>
        <Button variant="outline" className="size-10" onClick={() => setFilterOpen(true)}>
          <Filter className="size-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={paylinks}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        onRowClick={(item) => router.push(`/payment-links/${item.reference}`)}
        pageCount={pagination?.totalPages}
        currentPage={page}
        perPage={size}
        totalRecords={pagination?.totalRecords}
        itemOffset={page * size}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(s) => { setSize(s); setPage(0); }}
        emptyTitle="No payment links yet"
        emptyDescription="Create your first payment link to start collecting payments."
        emptyAction={{ label: "Create Link", onClick: () => setCreateOpen(true) }}
      />

      <ResponsiveModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filters"
        description="Filter payment links by status and activity"
      >
        <div className="space-y-4">
          <FormField label="Status">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Activity">
            <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setStatusFilter("");
              setIsActiveFilter("");
              setSearch("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={createOpen}
        onOpenChange={(open) => { if (!open) resetCreateModal(); }}
        title={createdLink ? "Payment Link Created" : "Create Payment Link"}
        description={createdLink ? "Share this link with your customers" : "Set up a new payment link"}
      >
        {createdLink ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ExternalLink className="size-4" />
                <span>Payment Link URL</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-background px-2 py-1 text-xs font-mono">
                  {createdLink.url}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(createdLink.url)}
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push(`/payment-links/${createdLink.reference}`)}
              >
                View Details
              </Button>
              <Button className="flex-1" onClick={resetCreateModal}>
                Create Another
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
            <FormField label="Amount" error={form.formState.errors.amount?.message} isRequired>
              <Input
                {...form.register("amount")}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </FormField>
            <FormField label="Currency" error={form.formState.errors.currency?.message} isRequired>
              <Select
                value={form.watch("currency")}
                onValueChange={(val) => form.setValue("currency", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Reason" isOptional>
              <Input {...form.register("reason")} placeholder="What is this link for?" />
            </FormField>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...form.register("isReusable")}
                className="size-4 rounded border-input accent-foreground"
              />
              <span className="text-sm font-medium">Reusable (can be paid multiple times)</span>
            </label>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Payment Link"}
            </Button>
          </form>
        )}
      </ResponsiveModal>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => { if (!open) setConfirmId(null); }}
        title={confirmAction === "ACTIVATE" ? "Activate Payment Link" : "Deactivate Payment Link"}
        description={
          confirmAction === "ACTIVATE"
            ? "This payment link will be available for customers to use."
            : "Customers will no longer be able to use this payment link."
        }
        confirmLabel={confirmAction === "ACTIVATE" ? "Activate" : "Deactivate"}
        variant="destructive"
        onConfirm={confirmManage}
        loading={manageMutation.isPending}
      />
    </motion.div>
  );
}


export default withSuspense(PaymentLinksContent);
