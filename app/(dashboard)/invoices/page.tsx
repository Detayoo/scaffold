"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Upload, Filter, Search, MoreHorizontal, Download, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FileUpload } from "@/components/FileUpload";
import { FormField } from "@/components/FormField";
import {
  getInvoicesFn,
  deleteInvoiceFn,
  downloadInvoiceFn,
  uploadInvoiceFn,
} from "@/services/queries/invoices";
import { toastMessage, extractError, formatDate, formatMoney, triggerFileDownload } from "@/utils";
import type { Invoice, FileType, FileUploadsType } from "@/types";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function InvoicesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileUploadsType>([]);

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["invoices", page, size, search, statusFilter, startDate, endDate],
    queryFn: () =>
      getInvoicesFn({
        page: page + 1,
        size,
        invoiceNumber: search || undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvoiceFn,
    onSuccess: (res) => {
      toastMessage("success", res.message);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setDeleteId(null);
    },
    onError: (err) => {
      toastMessage("error", extractError(err));
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadInvoiceFn,
    onSuccess: (res) => {
      toastMessage("success", res.message);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setUploadOpen(false);
      setFiles([]);
    },
    onError: (err) => {
      toastMessage("error", extractError(err));
    },
  });

  const handleDownload = async (id: string) => {
    try {
      const res = await downloadInvoiceFn(id);
      triggerFileDownload(res.data.url);
    } catch (err) {
      toastMessage("error", extractError(err));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    const formData = new FormData();
    files.filter((f): f is FileType => typeof f !== "string").forEach((f) => formData.append("file", f.file));
    await uploadMutation.mutateAsync(formData);
  };

  const invoices = data?.data?.invoices ?? [];
  const pagination = data?.data;

  const columns = [
    {
      key: "invoiceNumber",
      header: "Invoice #",
      cell: (item: Invoice) => (
        <span className="font-mono text-xs">{item.invoiceNumber}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (item: Invoice) => (
        <span>{item.customer?.name ?? "—"}</span>
      ),
    },
    {
      key: "totalAmount",
      header: "Amount",
      cell: (item: Invoice) => (
        <span className="font-medium">{item.currency} {formatMoney(item.totalAmount)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item: Invoice) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: "dueDate",
      header: "Due Date",
      cell: (item: Invoice) => (
        <span className="text-muted-foreground">{formatDate(item.dueDate)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item: Invoice) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/invoices/${item.id}`); }}>
              <Eye className="size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(item.id); }}>
              <Download className="size-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-medium">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage invoices for your customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
            <Upload />
            Upload CSV
          </Button>
          <Button size="sm" onClick={() => router.push("/invoices/create-invoice")}>
            <Plus />
            Create Invoice
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setFilterOpen(true)}>
          <Filter className="size-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        isFetching={isFetching}
        onRowClick={(item) => router.push(`/invoices/${item.id}`)}
        pageCount={pagination?.totalPages}
        currentPage={page}
        perPage={size}
        totalRecords={pagination?.totalRecords}
        itemOffset={page * size}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(s) => { setSize(s); setPage(0); }}
        emptyTitle="No invoices yet"
        emptyDescription="Create your first invoice to get started."
        emptyAction={{ label: "Create Invoice", onClick: () => router.push("/invoices/create-invoice") }}
      />

      <ResponsiveModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filters"
        description="Filter invoices by date range and status"
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
          <FormField label="Start Date">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </FormField>
          <FormField label="End Date">
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </FormField>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setStatusFilter("");
              setStartDate("");
              setEndDate("");
              setSearch("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </ResponsiveModal>

      <ResponsiveModal
        open={uploadOpen}
        onOpenChange={(open) => { if (!open) { setUploadOpen(false); setFiles([]); } }}
        title="Upload Invoices CSV"
        description="Import invoices from a CSV file"
      >
        <div className="space-y-4">
          <FileUpload
            files={files}
            setFiles={setFiles}
            accept=".csv"
            maxSizeMB={10}
            multiple={false}
          />
          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={files.length === 0 || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </ResponsiveModal>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutateAsync(deleteId)}
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
