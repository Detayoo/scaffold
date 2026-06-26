"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, Download, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import {
  getSingleInvoiceFn,
  deleteInvoiceFn,
  downloadInvoiceFn,
} from "@/services/queries/invoices";
import { toastMessage, extractError, formatDate, formatMoney, triggerFileDownload } from "@/utils";
import type { IInvoiceItem, TaxInvoiceRepr } from "@/types";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  params.then((p) => {
    if (!invoiceId) setInvoiceId(p.invoiceId);
  });

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: () => getSingleInvoiceFn(invoiceId!),
    enabled: !!invoiceId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoiceFn,
    onSuccess: (res) => {
      toastMessage("success", res.message);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.push("/invoices");
    },
    onError: (err) => {
      toastMessage("error", extractError(err));
    },
  });

  const handleDownload = async () => {
    if (!invoiceId) return;
    try {
      const res = await downloadInvoiceFn(invoiceId);
      triggerFileDownload(res.data.url);
    } catch (err) {
      toastMessage("error", extractError(err));
    }
  };

  if (!invoiceId) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState onRetry={refetch} message="Failed to load invoice. Please try again." />;
  }

  const invoice = data?.data?.invoice;
  if (!invoice) {
    return <ErrorState message="Invoice not found." />;
  }

  const items = invoice.items ?? [];
  const taxes = invoice.taxes ?? [];
  const subTotal = invoice.subTotal ?? 0;
  const discount = invoice.discount ?? 0;
  const total = invoice.totalAmount ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Invoices
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download />
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/invoices/update?id=${invoice.id}`)}
          >
            <Edit />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-mono">{invoice.invoiceNumber}</p>
            <h1 className="text-2xl font-medium">
              {invoice.currency} {formatMoney(total)}
            </h1>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="space-y-1 text-sm text-muted-foreground text-left sm:text-right">
            <p>
              <span className="font-medium text-foreground">Customer:</span>{" "}
              {invoice.customer?.name ?? "—"}
            </p>
            <p>
              <span className="font-medium text-foreground">Email:</span>{" "}
              {invoice.customer?.email ?? "—"}
            </p>
            <p>
              <span className="font-medium text-foreground">Invoice Date:</span>{" "}
              {invoice.createdAt ? formatDate(invoice.createdAt) : "—"}
            </p>
            <p>
              <span className="font-medium text-foreground">Due Date:</span>{" "}
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Item</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Qty</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Unit Price</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: IInvoiceItem) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2.5 font-medium">{item.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{item.description}</td>
                  <td className="px-4 py-2.5 text-right">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-right">
                    {invoice.currency} {formatMoney(item.unitPrice)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium">
                    {invoice.currency} {formatMoney(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{invoice.currency} {formatMoney(subTotal)}</span>
          </div>
          {taxes.map((tax: TaxInvoiceRepr) => (
            <div key={tax.id} className="flex justify-between">
              <span className="text-muted-foreground">{tax.name} ({tax.rate}%)</span>
              <span>{invoice.currency} {formatMoney(tax.amount)}</span>
            </div>
          ))}
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{invoice.currency} {formatMoney(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-1.5 font-medium">
            <span>Total</span>
            <span>{invoice.currency} {formatMoney(total)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
          <p className="text-sm">{invoice.notes}</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteMutation.mutateAsync(invoiceId!)}
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
