"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { MerchantReviewSheet } from "@/modals/MerchantReviewSheet";
import { withSuspense } from "@/components/withSuspense";
import type { Merchant } from "@/types";

const MOCK_MERCHANTS: Merchant[] = [
  { id: "87fb27f1-9221-46e6-a5e1-c03d2e6840b1", name: "Alausa Mart", email: "ops@alausamart.ng", accountNumber: "0123456789", status: "ACTIVE", address: "12 Allen Avenue, Ikeja", slug: "alausa-mart", webhookURL: null, collectionOptions: ["card", "bank_transfer"], createdAt: "2025-01-15T08:00:00.000Z", updatedAt: "2026-06-29T10:00:00.000Z", deletedAt: null, isPaylinkEnabled: true, isInvoiceEnabled: true, isReusablePaylinkEnabled: true },
  { id: "a2b3c4d5-6789-0123-4567-89abcdef012345", name: "Balogun Rice Store", email: "hello@balogunrice.ng", accountNumber: "0987654321", status: "ACTIVE", address: "54 Balogun Market, Lagos Island", slug: "balogun-rice", webhookURL: "https://hooks.balogunrice.ng/payment", collectionOptions: ["bank_transfer"], createdAt: "2025-03-20T12:00:00.000Z", updatedAt: "2026-06-28T14:00:00.000Z", deletedAt: null, isPaylinkEnabled: true, isInvoiceEnabled: false, isReusablePaylinkEnabled: false },
  { id: "e5f6a7b8-9012-3456-789a-bcdef012345678", name: "Ikeja Tech Hub", email: "biz@ikejatech.ng", accountNumber: "0555123456", status: "PENDING", address: "22 Computer Village, Ikeja", slug: "ikeja-tech", webhookURL: null, collectionOptions: ["card"], createdAt: "2026-06-01T09:00:00.000Z", updatedAt: "2026-06-01T09:00:00.000Z", deletedAt: null, isPaylinkEnabled: false, isInvoiceEnabled: false, isReusablePaylinkEnabled: false },
  { id: "c9d0e1f2-3456-789a-bcde-f0123456789012", name: "Lekki Fresh Foods", email: "info@lekkifresh.ng", accountNumber: "0777123456", status: "SUSPENDED", address: "5 Admiralty Way, Lekki", slug: "lekki-fresh", webhookURL: null, collectionOptions: ["card", "bank_transfer"], createdAt: "2024-11-10T07:00:00.000Z", updatedAt: "2026-06-25T16:30:00.000Z", deletedAt: null, isPaylinkEnabled: true, isInvoiceEnabled: true, isReusablePaylinkEnabled: true },
  { id: "f0a1b2c3-4567-8901-2345-6789abcdef0123", name: "Kano Textiles Ltd", email: "sales@kanotextiles.ng", accountNumber: "0333123456", status: "ACTIVE", address: "8 Bompai Road, Kano", slug: "kano-textiles", webhookURL: "https://hooks.kanotextiles.ng/pay", collectionOptions: ["bank_transfer"], createdAt: "2024-08-05T10:30:00.000Z", updatedAt: "2026-06-27T11:00:00.000Z", deletedAt: null, isPaylinkEnabled: true, isInvoiceEnabled: true, isReusablePaylinkEnabled: true },
];

function MerchantsContent() {
  const [search, setSearch] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  const filtered = useMemo(
    () => MOCK_MERCHANTS.filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const columns: Column<Merchant>[] = [
    { key: "name", header: "Name", cell: (m) => <span className="text-sm text-foreground">{m?.name}</span> },
    { key: "email", header: "Email", cell: (m) => <span className="text-sm text-foreground">{m?.email}</span> },
    { key: "status", header: "Status", cell: (m) => <StatusBadge status={m?.status} size="sm" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Merchants" description="Review and manage platform merchants" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search merchants..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isPending={false}
        isError={false}
        emptyTitle="No merchants found"
        emptyDescription={search ? "Try a different search term" : "No merchants registered"}
        onRowClick={(m) => setSelectedMerchant(m)}
      />

      <MerchantReviewSheet merchant={selectedMerchant} onOpenChange={(o) => { if (!o) setSelectedMerchant(null); }} />
    </div>
  );
}

export default withSuspense(MerchantsContent);
