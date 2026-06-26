"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Copy, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { getSinglePaymentLinkFn } from "@/services/queries/payment-links";
import { toastMessage, formatDate, formatMoney } from "@/utils";
import type { PaymentLinkTransaction } from "@/types";

export default function PaymentLinkDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [copied, setCopied] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  params.then((p) => {
    if (!reference) setReference(p.reference);
  });

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["payment-link", reference, page, size],
    queryFn: () =>
      getSinglePaymentLinkFn({ reference: reference ?? undefined, page: page + 1, size }),
    enabled: !!reference,
  });

  const paylink = data?.data?.paylink;
  const transactions = data?.data?.transactions;
  const pagination = data?.data;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastMessage("error", "Failed to copy");
    }
  };

  const columns = [
    {
      key: "reference",
      header: "Reference",
      cell: (item: PaymentLinkTransaction) => (
        <span className="font-mono text-xs">{item.reference}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (item: PaymentLinkTransaction) => (
        <span className="font-medium">{item.currency} {formatMoney(item.amount)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: PaymentLinkTransaction) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: "customerEmail",
      header: "Customer",
      cell: (item: PaymentLinkTransaction) => (
        <span className="text-muted-foreground">{item.customerEmail || "—"}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (item: PaymentLinkTransaction) => (
        <span className="text-muted-foreground">{formatDate(item.createdAt)}</span>
      ),
    },
  ];

  if (!reference) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Link
        href="/payment-links"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Payment Links
      </Link>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-mono">{paylink?.reference}</p>
            <h1 className="text-2xl font-medium">
              {paylink?.currency} {formatMoney(paylink?.amount ?? 0)}
            </h1>
            <div className="flex items-center gap-2">
              <StatusBadge status={paylink?.status ?? ""} size="sm" />
              {paylink?.isReusable && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  Reusable
                </span>
              )}
            </div>
            {paylink?.reason && (
              <p className="text-sm text-muted-foreground">{paylink.reason}</p>
            )}
          </div>
          {paylink?.url && (
            <div className="flex items-center gap-2">
              <code className="hidden sm:block max-w-[280px] truncate rounded bg-muted px-2 py-1 text-xs font-mono">
                {paylink.url}
              </code>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => handleCopy(paylink.url)}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">Transactions</h2>
        <DataTable
          columns={columns}
          data={transactions}
          isPending={isPending}
          isError={isError}
          onRetry={refetch}
          isFetching={isFetching}
          pageCount={pagination?.totalPages}
          currentPage={page}
          perPage={size}
          totalRecords={pagination?.totalRecords}
          itemOffset={page * size}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(s) => { setSize(s); setPage(0); }}
          emptyTitle="No transactions yet"
          emptyDescription="Transactions from this payment link will appear here."
        />
      </div>
    </motion.div>
  );
}
