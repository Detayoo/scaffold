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
  pageCount?: number;
  currentPage?: number;
  perPage?: number;
  totalRecords?: number;
  itemOffset?: number;
  onPageChange?: (selected: number) => void;
  onPerPageChange?: (size: number) => void;
  isFetching?: boolean;
  selectOptions?: number[];
  onRowClick?: (item: T) => void;
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
}: DataTableProps<T>) {
  const hasEverLoaded = data !== undefined;
  const isEmpty = hasEverLoaded && (!data || data.length === 0);
  const showPagination = totalRecords && totalRecords > 0;

  const renderBodyContent = () => {
    if (data && data.length > 0) {
      return data.map((item, idx) => (
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
      ));
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-80 p-0">
          <div className="flex items-center justify-center h-full">
            {!hasEverLoaded && isPending ? (
              <LoadingState />
            ) : !hasEverLoaded && isError ? (
              <ErrorState message={errorMessage} onRetry={onRetry} errorCode={errorCode} />
            ) : isEmpty && !isPending ? (
              <EmptyState title={emptyTitle ?? "No data"} description={emptyDescription} action={emptyAction} />
            ) : !hasEverLoaded ? (
              <LoadingState />
            ) : null}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("relative rounded-lg border bg-background", containerClassName)}>
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
              {/* Refetching overlay */}
              {isFetching && hasEverLoaded && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="relative p-0">
                    <div className="absolute inset-x-0 top-0 z-10 flex justify-center bg-background/50 py-3">
                      <div className="size-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Error banner on refetch */}
              {isError && hasEverLoaded && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="bg-destructive/5 px-4 py-2">
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <span>{errorMessage ?? "Failed to load"}</span>
                      {onRetry && (
                        <button onClick={onRetry} className="ml-auto font-medium underline underline-offset-2 hover:no-underline cursor-pointer">
                          Retry
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Rows or state */}
              {renderBodyContent()}
            </TableBody>
          </Table>
        </div>
      </div>

      {showPagination && onPageChange && (
        <Pagination
          pageCount={pageCount ?? 0}
          currentPage={currentPage ?? 0}
          perPage={perPage ?? 10}
          totalRecords={totalRecords ?? 0}
          itemOffset={itemOffset ?? 0}
          currentItems={data ?? []}
          handlePageClick={({ selected }: { selected: number }) => onPageChange(selected)}
          handlePerPage={onPerPageChange ? (e: any) => onPerPageChange(Number(e.target.value)) : undefined}
          isFetching={isFetching ?? false}
          selectOptions={selectOptions}
        />
      )}
    </div>
  );
}
