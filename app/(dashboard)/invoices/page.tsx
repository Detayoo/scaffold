"use client";

import { useState, Suspense } from "react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
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
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FileUpload } from "@/components/FileUpload";
import { DatePicker } from "@/components/DatePicker";
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

function InvoicesContent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
  const [size, setSize] = useQueryState("size", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState("status", parseAsString.withDefault(""));
  const [startDate, setStartDate] = useQueryState("startDate", parseAsString.withDefault(""));
  const [endDate, setEndDate] = useQueryState("endDate", parseAsString.withDefault(""));
  const [filterOpen, setFilterOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("");
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");
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

  const invoices = data?.data?.invoices;
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
        <PageHeader title="Invoices" description="Create and manage invoices for your customers" />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setUploadOpen(true)}>
            <Upload />
            Upload CSV
          </Button>
          <Button onClick={() => router.push("/invoices/create-invoice")}>
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
        <Button variant="outline" className="size-10" onClick={() => setFilterOpen(true)}>
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
        onOpenChange={(open) => {
          setFilterOpen(open);
          if (open) {
            setLocalStatus(statusFilter);
            setLocalStartDate(startDate);
            setLocalEndDate(endDate);
          }
        }}
        title="Filters"
        description="Filter invoices by date range and status"
      >
        <div className="space-y-4">
          <FormField label="Status">
            <Select value={localStatus} onValueChange={setLocalStatus}>
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
          <DatePicker value={localStartDate ? new Date(localStartDate) : undefined} onChange={(d) => setLocalStartDate(d ? d.toISOString().split("T")[0] : "")} label="Start Date" />
          <DatePicker value={localEndDate ? new Date(localEndDate) : undefined} onChange={(d) => setLocalEndDate(d ? d.toISOString().split("T")[0] : "")} label="End Date" />
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                setStatusFilter(localStatus);
                setStartDate(localStartDate);
                setEndDate(localEndDate);
                setFilterOpen(false);
              }}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setLocalStatus("");
                setLocalStartDate("");
                setLocalEndDate("");
                setStatusFilter("");
                setStartDate("");
                setEndDate("");
                setFilterOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
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

export default function InvoicesPage() {
  return (
    <Suspense fallback={null}>
      <InvoicesContent />
    </Suspense>
  );
}
