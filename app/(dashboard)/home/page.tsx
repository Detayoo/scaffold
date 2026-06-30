"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CreditCard, FileText, Receipt, RefreshCw, TrendingUp, Landmark } from "lucide-react";
import Link from "next/link";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { useAuth } from "@/contexts/auth-context";
import { getTransactionsFn, getDashboardHomeFn } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { AsyncContent } from "@/components/AsyncContent";
import { formatDate, formatMoney } from "@/utils";

export default function HomePage() {
  const { merchant } = useAuth();
  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  const { data: homeData } = useQuery({
    queryKey: ["dashboard-home"],
    queryFn: getDashboardHomeFn,
  });

  const { data: txData, isPending: txPending, isFetching: txLoading, isError: txError, refetch: refetchTx } = useQuery({
    queryKey: ["dashboard-transactions"],
    queryFn: () => getTransactionsFn(),
  });

  const home = homeData?.data;
  const transactions = txData?.data;

  const ngnBalance = home?.balances?.find((b: any) => b?.currency === "NGN");

  const todayStats = [
    { icon: Receipt, label: "Payments", value: home?.today?.successful_payments },
    { icon: TrendingUp, label: "Net Volume", value: home?.today?.net_amount_minor, compact: true },
  ];

  const balanceStats = [
    { icon: Landmark, label: "Pending Settlement", value: ngnBalance?.pending_amount_minor, compact: true },
    { icon: RefreshCw, label: "Available Balance", value: ngnBalance?.available_amount_minor, compact: true },
  ];

  const quickActions = [
    { label: "Create Payment Link", href: "/payment-links", icon: CreditCard },
    { label: "Send Invoice", href: "/invoices/create-invoice", icon: FileText },
    { label: "View Transactions", href: "/transactions", icon: Receipt },
    { label: "View Refunds", href: "/refunds", icon: RefreshCw },
  ];

  return (
    <div className="space-y-6">
      <div>
        <PageHeader title={`Welcome back, ${merchant?.name ?? "Merchant"}`} description={today} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Today</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {todayStats.map((s) => (
            <AnalyticsCard key={s.label} icon={s.icon} label={s.label} value={s.value} compact={s.compact} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Balances</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {balanceStats.map((s) => (
            <AnalyticsCard key={s.label} icon={s.icon} label={s.label} value={s.value} compact={s.compact} />
          ))}
        </div>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button variant="outline" className="gap-2">
                    <action.icon className="size-4" />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AsyncContent isPending={txPending} isError={txError} onRetry={refetchTx} errorMessage="Failed to load transactions">
              {!transactions || transactions.length === 0 ? (
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
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Status</th>
                        <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-foreground md:table-cell">Customer</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
{transactions.map((tx: any) => (
                        <tr key={tx?.reference} className="border-b last:border-0">
                          <td className="px-4 py-3 text-sm text-foreground">{tx?.reference}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{formatMoney(tx?.amount)}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={tx?.status} />
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                            {tx?.customer?.name ?? tx?.customer?.email ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                            {tx?.created_at ? formatDate(tx?.created_at) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AsyncContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
