"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "motion/react";
import { CreditCard, FileText, Receipt, RefreshCw, TrendingUp, Wallet } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import Link from "next/link";

import { useAuth } from "@/contexts/auth-context";
import { getTransactionsFn, getCollectionsFn } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { formatDate, formatMoney } from "@/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { merchant } = useAuth();
  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  const { data: txData, isFetching: txLoading, isError: txError, refetch: refetchTx } = useQuery({
    queryKey: ["dashboard-transactions"],
    queryFn: () => getTransactionsFn({ page: 1, size: 5 }),
  });

  const { data: collectionsData } = useQuery({
    queryKey: ["dashboard-collections"],
    queryFn: getCollectionsFn,
  });

  const transactions = txData?.data?.transactions ?? [];
  const totalTransactions = txData?.data?.totalRecords ?? 0;
  const activeCollections = collectionsData?.data?.collectionOptions?.filter((c) => c.status === "active")?.length ?? 0;

  const stats = [
    {
      icon: Receipt,
      label: "Total Transactions",
      value: totalTransactions,
    },
    {
      icon: Wallet,
      label: "Volume",
      value: (
        <>
          {formatMoney(transactions.reduce((sum, t) => sum + (t?.amount ?? 0), 0))}
        </>
      ),
    },
    {
      icon: TrendingUp,
      label: "Active Collections",
      value: activeCollections,
    },
    {
      icon: RefreshCw,
      label: "Account",
      value: merchant?.accountNumber ?? "—",
      mono: true,
    },
  ];

  const quickActions = [
    { label: "Create Payment Link", href: "/payment-links", icon: CreditCard },
    { label: "Send Invoice", href: "/invoices/create-invoice", icon: FileText },
    { label: "View Transactions", href: "/transactions", icon: Receipt },
    { label: "View Refunds", href: "/refunds", icon: RefreshCw },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-medium text-foreground">
          Welcome back, {merchant?.name ?? "Merchant"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <stat.icon className="size-4 text-muted-foreground" />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={stat.mono ? "text-2xl font-semibold font-mono" : "text-2xl font-semibold"}>
                {typeof stat.value === "number" ? (
                  <CountUp end={stat.value} />
                ) : (
                  stat.value
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <action.icon className="size-4" />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {txLoading && transactions.length === 0 ? (
              <div className="p-4">
                <LoadingState />
              </div>
            ) : txError && transactions.length === 0 ? (
              <div className="p-4">
                <ErrorState message="Failed to load transactions" onRetry={refetchTx} />
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No transactions yet" description="Your first transaction will appear here" />
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                {txLoading && (
                  <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/50 pt-8">
                    <div className="size-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                  </div>
                )}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                      <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">Customer</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-mono text-xs">{tx.reference}</td>
                        <td className="px-4 py-3">
                          {formatMoney(tx.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={tx.status} size="sm" />
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {tx.customerName ?? tx.customerEmail ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
