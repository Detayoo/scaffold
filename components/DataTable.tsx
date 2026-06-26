"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Pagination } from "@/components/Pagination";

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data?: T[];
  isPending?: boolean;
  isError?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  errorMessage?: string;
  errorCode?: number;
  className?: string;
  containerClassName?: string;
  // Pagination
  pageCount?: number;
  currentPage?: number;
  perPage?: number;
  totalRecords?: number;
  itemOffset?: number;
  onPageChange?: (selected: number) => void;
  onPerPageChange?: (size: number) => void;
  isFetching?: boolean;
  selectOptions?: number[];
  // Row click
  onRowClick?: (item: T) => void;
  // Fixed height container (no flicker)
  minHeight?: string;
}

export function DataTable<T>({
  columns,
  data,
  isPending,
  isError,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  errorMessage,
  errorCode,
  className,
  containerClassName,
  pageCount,
  currentPage,
  perPage,
  totalRecords,
  itemOffset,
  onPageChange,
  onPerPageChange,
  isFetching,
  selectOptions,
  onRowClick,
  minHeight = "min-h-[400px]",
}: DataTableProps<T>) {
  const hasEverLoaded = data !== undefined;
  const isEmpty = hasEverLoaded && (!data || data.length === 0);
  const showPagination = totalRecords && totalRecords > 0;

  const renderContent = () => {
    // Phase 1: No data ever received — show loading skeleton
    if (!hasEverLoaded && isPending) {
      return (
        <div className="flex items-center justify-center p-6" style={{ minHeight: "inherit" }}>
          <LoadingState variant="skeleton" />
        </div>
      );
    }

    // Phase 2: No data ever received and error — show error
    if (!hasEverLoaded && isError) {
      return (
        <div className="flex items-center justify-center p-6" style={{ minHeight: "inherit" }}>
          <ErrorState
            message={errorMessage}
            onRetry={onRetry}
            errorCode={errorCode}
          />
        </div>
      );
    }

    // Phase 3: Data confirmed empty — show empty (but ONLY if not loading)
    if (isEmpty && !isPending) {
      return (
        <div className="flex items-center justify-center p-6" style={{ minHeight: "inherit" }}>
          <EmptyState
            title={emptyTitle ?? "No data"}
            description={emptyDescription}
            action={emptyAction}
          />
        </div>
      );
    }

    // Phase 4: Data exists (or had existed) — ALWAYS render, overlay loading
    return (
      <>
        {/* Subtle loading indicator during refetch */}
        {isFetching && hasEverLoaded && (
          <div className="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-background/50 pt-8">
            <div className="size-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          </div>
        )}
        {/* Error banner when data exists but refetch failed */}
        {isError && hasEverLoaded && (
          <div className="flex items-center gap-2 border-b bg-destructive/5 px-4 py-2 text-xs text-destructive">
            <span>{errorMessage ?? "Failed to load. Showing cached data."}</span>
            {onRetry && (
              <button onClick={onRetry} className="ml-auto font-medium underline underline-offset-2 hover:no-underline cursor-pointer">
                Retry
              </button>
            )}
          </div>
        )}
        {!isEmpty ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn("text-xs font-medium uppercase text-muted-foreground", col.className)}
                    >
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data!.map((item, idx) => (
                  <TableRow
                    key={idx}
                    onClick={() => onRowClick?.(item)}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.cell(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative rounded-lg border bg-background",
          minHeight,
          containerClassName
        )}
      >
        {renderContent()}
      </div>

      {showPagination && onPageChange && (
        <Pagination
          pageCount={pageCount ?? 0}
          currentPage={currentPage ?? 0}
          perPage={perPage ?? 10}
          totalRecords={totalRecords ?? 0}
          itemOffset={itemOffset ?? 0}
          currentItems={data ?? []}
          handlePageClick={({ selected }: { selected: number }) =>
            onPageChange(selected)
          }
          handlePerPage={
            onPerPageChange
              ? (e: any) => onPerPageChange(Number(e.target.value))
              : undefined
          }
          isFetching={isFetching ?? false}
          selectOptions={selectOptions}
        />
      )}
    </div>
  );
}
