"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { ResponsiveSheet } from "@/components/ResponsiveSheet";
import { AsyncContent } from "@/components/AsyncContent";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AssignDvaModal } from "@/modals/AssignDvaModal";
import { getCustomerDvasFn } from "@/services";
import type { GatewayCustomer, VirtualAccount } from "@/types";

interface CustomerDetailSheetProps {
  customer: GatewayCustomer | null;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailSheet({ customer, onOpenChange }: CustomerDetailSheetProps) {
  const [assignOpen, setAssignOpen] = useState(false);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["customer-dvas", customer?.id],
    queryFn: () => getCustomerDvasFn({ id: customer?.id! }),
    enabled: !!customer?.id,
  });

  const dvas = data?.data;

  return (
    <>
      <ResponsiveSheet
        open={!!customer}
        onOpenChange={(o) => { if (!o) onOpenChange(false); }}
        title="Customer Details"
      >
        <AsyncContent isPending={isPending} isError={isError} onRetry={refetch} errorMessage="Failed to load customer details.">
          {customer ? (
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div>
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="text-sm text-foreground">{customer?.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm text-foreground">{customer?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{customer?.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={customer?.status ?? ""} size="sm" />
                </div>
              </div>

              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Dedicated Accounts</p>
                {dvas && dvas.length > 0 ? (
                  <div className="space-y-2">
                    {dvas.map((va: VirtualAccount) => (
                      <div key={va?.id} className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{va?.accountNumber}</p>
                          <StatusBadge status={va?.status} size="sm" />
                        </div>
                        <p className="text-sm text-foreground">{va?.accountName}</p>
                        <p className="text-xs text-muted-foreground">{va?.bankName}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No dedicated accounts assigned.</p>
                )}
                <Button variant="outline" className="w-full mt-3 gap-2" onClick={() => setAssignOpen(true)}>
                  <Plus className="size-4" />
                  Assign Account
                </Button>
              </div>
            </div>
          ) : null}
        </AsyncContent>
      </ResponsiveSheet>

      <AssignDvaModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        customerId={customer?.id ?? ""}
        onSuccess={() => refetch()}
      />
    </>
  );
}
