"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";

import { getSettlementDetailFn } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { AsyncContent } from "@/components/AsyncContent";
import { DetailRow } from "@/components/DetailRow";
import { StatusBadge } from "@/components/StatusBadge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatMoney } from "@/utils";

export default function SettlementDetailPage({
  params,
}: {
  params: Promise<{ settlementId: string }>;
}) {
  const { settlementId } = use(params);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["settlement-detail", settlementId],
    queryFn: () => getSettlementDetailFn({ id: settlementId }),
    enabled: !!settlementId,
  });

  const detail = data?.data;
  const batch = detail?.batch;
  const items = detail?.items ?? [];
  const payout = detail?.payout;

  return (
    <div className="space-y-6">
      <PageHeader title={`Settlement ${settlementId?.slice(0, 8)}...`} description="Full settlement statement" />

      <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load settlement">
        {detail ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <DetailRow label="Status" value={<StatusBadge status={batch?.status ?? ""} size="sm" />} />
                <DetailRow label="Channel" value={batch?.channel} capitalize />
                <DetailRow label="Provider" value={batch?.provider} />
                <DetailRow label="Gross" value={formatMoney(batch?.grossAmountMinor)} />
                <DetailRow label="Fee" value={formatMoney(batch?.feeAmountMinor)} />
                <DetailRow label="Net" value={formatMoney(batch?.netAmountMinor)} />
                <DetailRow label="Items" value={batch?.itemCount} />
                <DetailRow label="Reconciliation" value={<StatusBadge status={batch?.reconciliationStatus ?? ""} size="sm" />} />
                <DetailRow label="Approved" value={batch?.approvedAt ? formatDate(batch.approvedAt) : "—"} />
              </CardContent>
            </Card>

            {payout && (
              <Card>
                <CardHeader>
                  <CardTitle>Payout</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <DetailRow label="Reference" value={payout?.reference} />
                  <DetailRow label="Amount" value={formatMoney(payout?.amountMinor)} />
                  <DetailRow label="Paid At" value={formatDate(payout?.paidAt)} />
                </CardContent>
              </Card>
            )}

            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Transactions ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Reference</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Channel</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Fee</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Net</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr key={item?.ledgerGroupId ?? idx} className="border-b last:border-0">
                            <td className="px-4 py-3 text-sm text-foreground">{item?.reference}</td>
                            <td className="px-4 py-3 text-sm capitalize text-foreground">{item?.channel}</td>
                            <td className="px-4 py-3 text-sm text-foreground">{formatMoney(item?.amountMinor)}</td>
                            <td className="px-4 py-3 text-sm text-foreground">{formatMoney(item?.feeMinor)}</td>
                            <td className="px-4 py-3 text-sm text-foreground">{formatMoney(item?.netMinor)}</td>
                            <td className="px-4 py-3"><StatusBadge status={item?.status} size="sm" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </AsyncContent>
    </div>
  );
}
